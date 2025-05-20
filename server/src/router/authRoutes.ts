import type { Request, Response } from "express";
import { createPasswordResetToken, resetPassword } from "../auth/resetPassword";
import { generateToken, protect, verifyPassword } from "../auth";

import { db } from "../db";
import { eq } from "drizzle-orm";
import express from "express";
import signup from "../auth/signup";
import { usersTable } from "../db/schema/users";
import { verify } from "../auth/verify";

const router = express.Router();

router.get(
  "/user",
  protect,
  async (req: Request, res: Response): Promise<void> => {
    const { user } = req;
    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const userInfo = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, user.id),
    });
    res.json(userInfo);
  }
);

// POST /auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email as string),
      columns: {
        id: true,
        email: true,
        name: true,
        image: true,
        password: true,
        salt: true,
      },
    });

    if (!user || !user.password || !user.salt) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isValidPassword = await verifyPassword(
      password,
      user.password,
      user.salt
    );

    if (!isValidPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id, user.email);

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.image,
    };

    res.json({
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

// GET /auth/session
router.get("/session", protect, (req: Request, res: Response): void => {
  if (req.user) {
    res.json({ user: req.user });
    return;
  } else {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
});

// POST /auth/logout
router.post("/logout", (_req: Request, res: Response): void => {
  // We have a token-based auth, logout is handled client-side by discarding the token.
  // We can add a server-side logout handling if needed.
  res.json({
    message: "Logout successful. Please clear token on client-side.",
  });
});

// POST /auth/signup
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const result = await signup(email, password);
    res.json({
      message: "Sign up successful. Please verify your email",
      user: { id: result.id, email: result.email },
    });
  } catch (error: unknown) {
    console.error("Signup error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to sign up";
    res.status(400).json({ message: errorMessage });
  }
});

// GET /auth/verify-email
router.get(
  "/verify-email",
  async (req: Request, res: Response): Promise<void> => {
    const { token, email } = req.query;
    console.log(token, email);

    if (!token || !email) {
      res.status(400).json({ message: "Token and email are required" });
      return;
    }

    try {
      await verify(token as string, email as string);

      res.json({
        message: "Email verification successful. You can now log in.",
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to verify email. Please try again.",
      });
    }
  }
);

// POST /auth/forgot-password
router.post(
  "/forgot-password",
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    try {
      // We don't want to reveal if a user exists or not for security reasons
      // So we'll simply return a success message even if the user doesn't exist
      try {
        await createPasswordResetToken(email);
      } catch (error) {
        // If error is user not found, we just ignore it and return success anyway
        if (
          !(error instanceof Error && error.message.includes("No user found"))
        ) {
          throw error;
        }
      }

      res.json({
        message:
          "If an account with that email exists, we've sent a password reset link",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        message:
          "Failed to process password reset request. Please try again later.",
      });
    }
  }
);

// POST /auth/reset-password
router.post(
  "/reset-password",
  async (req: Request, res: Response): Promise<void> => {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      res
        .status(400)
        .json({ message: "Token, email, and password are required" });
      return;
    }

    try {
      await resetPassword(token, email, password);
      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again.";
      res.status(400).json({ message: errorMessage });
    }
  }
);

export default router;
