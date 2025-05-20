import z from "zod";

import { camelize } from "../..";

export const TagSchema = z.preprocess(
  (data) => camelize(data),
  z.object({
    tagId: z.number(),
    tagName: z.string(),
  })
);
export const TagsSchema = z.array(TagSchema);
export type Tag = z.infer<typeof TagSchema>;

export const KeyMessageSchema = z.preprocess(
  (data) => camelize(data),
  z.object({
    appCode: z.string(),
    keyMessage: z.string(),
    keyMessageNumber: z.number(),
    createdAt: z.coerce.date().optional(),
  })
);
export const KeyMessagesSchema = z.array(KeyMessageSchema);
export type KeyMessage = z.infer<typeof KeyMessageSchema>;
