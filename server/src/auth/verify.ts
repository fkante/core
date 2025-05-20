import { and, eq, gt } from "drizzle-orm";

import { db } from "../db";
import { env } from "../env";
import jwt from "jsonwebtoken";
import { sendGridEmail } from "../twilio";
import { usersTable } from "../db/schema/users";
import { verificationTokensTable } from "../db/schema/auth";

type DecodedToken = {
  id: string;
  iat: number;
};

function encodeToken(id: string): string {
  return jwt.sign({ id, iat: new Date().getTime() }, env.JWT_SECRET);
}

function decodeToken(token: string): DecodedToken {
  return jwt.verify(token, env.JWT_SECRET) as DecodedToken;
}

async function sendVerificationEmail(email: string, token: string) {
  const encodedToken = encodeToken(token);
  const confirmationLink = `${env.CLIENT_URL}/verify-email?token=${encodedToken}&email=${email}`;

  const emailBody = `
    Hi !

    Thank you for signing up for Kovalee Kreators Platform! We're thrilled to have you join our community of talented Kreators.

    To complete your registration and activate your account, please click on the following link:

    ${confirmationLink}

    Once you've confirmed your account, you'll have access to all the features and opportunities Kovalee Kreators Platform has to offer.

    If you have any questions or need assistance, feel free to reach out to our support team at content@kovalee.app.

    We're excited to see what you create!

    Best,

    Content Team @ Kovalee Kreators
  `;

  await sendGridEmail(email, "Verify your account", emailBody);
}

async function verify(token: string, email: string) {
  const decoded = decodeToken(token);
  const now = new Date();
  const verificationToken =
    await db.query.verificationTokensTable.findFirst({
      where: and(
        eq(verificationTokensTable.identifier, email),
        eq(verificationTokensTable.token, decoded.id),
        gt(verificationTokensTable.expires, now)
      ),
    });

  console.log("verificationToken", verificationToken);


  if (!verificationToken) {
    throw new Error(
      "Invalid or expired verification token. Please request a new one."
    );
  }
  console.log("Verification token found");

  await db
    .update(usersTable)
    .set({
      verified: true,
    })
    .where(eq(usersTable.email, email));

  await db
    .delete(verificationTokensTable)
    .where(
      and(
        eq(verificationTokensTable.identifier, email),
        eq(verificationTokensTable.token, decoded.id)
      )
    );
}

export { sendVerificationEmail, verify };
