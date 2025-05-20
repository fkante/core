import { KeyMessagesSchema, TagsSchema } from "./schemas";

import { createQueryString } from "..";
import { getAppCodeWithoutPlatform } from "../..";

const BASE_URL = process.env.SERVER_BASE_URL || "http://localhost:4000";

/**
 * Get tags from kwartz db
 * You can filter tags by creativeId or searchText
 * By default, get all tags
 * @param creativeId - creativeId to filter tags
 * @param searchText - search text to filter tags
 * @returns tags
 */
export async function getTags({
  creativeId,
  searchText,
}: {
  creativeId?: string;
  searchText?: string;
} = {}) {
  const queryString = createQueryString({ creativeId, searchText });
  const response = await fetch(`${BASE_URL}/kwartz/tags` + queryString);
  const rawData = await response.json();
  if (!rawData.tags) {
    throw new Error("Tags not found");
  }
  const tags = TagsSchema.parse(rawData.tags);
  return tags;
}

export async function getKeyMessages(appCode: string) {
  const appCodeCorrected = getAppCodeWithoutPlatform(appCode);
  const response = await fetch(
    `${BASE_URL}/kwartz/key-messages?appCode=${appCodeCorrected}`
  );
  const rawData = await response.json();
  if (!rawData.keyMessages) {
    throw new Error("Key messages not found");
  }
  const keyMessages = KeyMessagesSchema.parse(rawData.keyMessages);
  return keyMessages;
}

export async function getAllKeyMessages() {
  const response = await fetch(`${BASE_URL}/kwartz/all-key-messages`);
  const rawData = await response.json();
  if (!rawData.keyMessages) {
    throw new Error("Key messages not found");
  }
  const keyMessages = KeyMessagesSchema.parse(rawData.keyMessages);
  return keyMessages;
}
