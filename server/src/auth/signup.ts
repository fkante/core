import { db } from "../db";
import { eq } from "drizzle-orm";
import { hashPassword } from ".";
import { sendVerificationEmail } from "./verify";
import { usersTable } from "../db/schema/users";
import { v4 } from "uuid";
import { verificationTokensTable } from "../db/schema/auth";

async function signup(email: string, password: string) {
  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email as string),
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const { passwordHash, salt } = await hashPassword(password);

  const now = new Date();
  const id = v4();

  await db.insert(usersTable).values({
    id,
    email: email as string,
    name: "",
    password: passwordHash,
    salt: salt.toString("hex"),
    createdAt: now,
    updatedAt: now,
    image: `https://api.dicebear.com/7.x/lorelei/svg?seed=${id}`,
    verified: false,
  });

  const token = v4();
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 24);

  await db.insert(verificationTokensTable).values({
    identifier: email,
    token,
    expires: expiryDate,
  });

  await sendVerificationEmail(email, token);
  return { id, email };
}

export default signup;
