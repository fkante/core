// Import to ensure express type extensions are loaded
// This is necessary to ensure that the `req.user` object is properly typed
import "../types/express.d.ts";

import type { NextFunction, Request, Response } from "express";

import argon2 from "argon2";
import crypto from "crypto";
import { db } from "../db";
import { env } from "../env";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { usersTable } from "../db/schema/users";

/**
 * Hashes a password using Argon2.
 * @param password The plain text password.
 * @returns The hashed password and salt.
 */
export async function hashPassword(
  password: string
): Promise<{ passwordHash: string; salt: Buffer }> {
  // TODO: Make sure this is the exact same process as the current Kreator
  const salt = crypto.randomBytes(16);
  const passwordHash = await argon2.hash(password, {
    memoryCost: 2 ** 15,
    parallelism: 3,
    salt,
  });
  return { passwordHash, salt };
}

/**
 * Verifies a user's password using Argon2.
 * @param plainPassword The plain text password.
 * @param hashedPassword The hashed password from the database.
 * @param salt The salt used for hashing from the database.
 * @returns True if the password is valid, false otherwise.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  const salt = Buffer.from(storedSalt, "hex");
  const isValidPassword = await argon2.verify(storedHash, password, {
    //@ts-expect-error argon2 has been rolled back to 0.31.2
    memoryCost: 2 ** 15,
    parallelism: 3,
    salt,
  });
  return isValidPassword;
}

/**
 * Generates a JWT for a user.
 * @param userId The user's ID.
 * @param email The user's email.
 * @returns A JWT string.
 */
export function generateToken(userId: string, email: string): string {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  const secret = env.JWT_SECRET;
  return jwt.sign({ id: userId, email }, secret);
}

/**
 * Middleware to protect routes.
 * Verifies JWT from the Authorization header.
 */
export async function protect(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }

  try {
    if (!env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is not defined for verification. Server configuration issue."
      );
      res.status(500).json({ message: "Server configuration error" });
      return;
    }
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
    };

    const currentUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, decoded.id),
      columns: {
        id: true,
        email: true,
        name: true,
        image: true,
        verified: true,
      },
    });

    if (!currentUser) {
      res.status(401).json({
        message: "User belonging to this token does no longer exist.",
      });
      return;
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
    return;
  }
}
