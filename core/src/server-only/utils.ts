import { AuthenticatedUser, AuthenticatedUserSchema } from "../definitions";

import { IncomingHttpHeaders } from "http";
import { convertBufferToJson } from "../utils";
import fs from "fs";

export async function downloadFile(url: string) {
  const response = await fetch(url);
  const file = await response.arrayBuffer();
  return Buffer.from(file);
}
export function getJsonFromFilePath(filePath: string) {
  return convertBufferToJson(fs.readFileSync(filePath));
}
export function isDev() {
  return process.env.NODE_ENV !== "production";
}
// pull json encoded user from express headers
export function getUserFromHeader(
  headers: IncomingHttpHeaders
): AuthenticatedUser {
  const userHeader = headers["x-user"];
  let userString: string | undefined;
  if (typeof userHeader === "string") {
    userString = userHeader;
  }
  if (Array.isArray(userHeader) && userHeader.length > 0) {
    userString = userHeader[0];
  }
  if (userString) {
    const user = JSON.parse(userString);
    const validatedUser = AuthenticatedUserSchema.parse(user);
    return validatedUser;
  }
  throw new Error("no user found in headers");
}
