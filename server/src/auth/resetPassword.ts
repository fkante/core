import { and, eq, gt } from "drizzle-orm";

import { db } from "../db";
import { env } from "../env";
import { hashPassword } from ".";
import { passwordResetTokensTable } from "../db/schema/auth";
import { sendGridEmail } from "../twilio";
import { usersTable } from "../db/schema/users";
import { v4 } from "uuid";

function encodeToken(token: string): string {
  return encodeURIComponent(token);
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const encodedToken = encodeToken(token);
  const resetLink = `${env.CLIENT_URL}/reset-password?token=${encodedToken}&email=${email}`;

  const emailBody = `
    Hi!

    You recently requested to reset your password for your Kovalee Kreators Platform account.

    To reset your password, please click on the following link:

    ${resetLink}

    This link will expire in 24 hours. If you did not request a password reset, please ignore this email.

    If you have any questions or need assistance, feel free to reach out to our support team at content@kovalee.app.

    Best,

    Content Team @ Kovalee Kreators
  `;

  await sendGridEmail(email, "Reset your password", emailBody);
}

export async function createPasswordResetToken(email: string): Promise<string> {
  // Check if user exists
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (!user) {
    throw new Error("No user found with this email address");
  }

  // Generate token
  const token = v4();
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 24);

  // Delete any existing reset tokens for this user
  await db
    .delete(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.identifier, email));

  // Create new reset token
  await db.insert(passwordResetTokensTable).values({
    identifier: email,
    token,
    expires: expiryDate,
  });

  // Send email with reset link
  await sendPasswordResetEmail(email, token);

  return token;
}

export async function resetPassword(token: string, email: string, newPassword: string): Promise<void> {
  // Find valid token
  const resetToken = await db.query.passwordResetTokensTable.findFirst({
    where: and(
      eq(passwordResetTokensTable.identifier, email),
      eq(passwordResetTokensTable.token, token),
      gt(passwordResetTokensTable.expires, new Date())
    ),
  });

  if (!resetToken) {
    throw new Error("Invalid or expired token");
  }

  const { passwordHash, salt } = await hashPassword(newPassword);

  // Update user password
  await db
    .update(usersTable)
    .set({
      password: passwordHash,
      salt: salt.toString("hex"),
      updatedAt: new Date(),
    })
    .where(eq(usersTable.email, email));

  // Delete used token
  await db
    .delete(passwordResetTokensTable)
    .where(and(
      eq(passwordResetTokensTable.identifier, email),
      eq(passwordResetTokensTable.token, token)
    ));
}
