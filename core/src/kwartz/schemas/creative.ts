import { camelize } from "../..";
import z from "zod";

export const MediaType = z.enum(["VID", "IMG"]);
export const CreativeStatus = z.enum([
  "Top Spender",
  "Winner",
  "Tested",
  "Testing",
  "Production",
]);

export const CreativeSchema = z.preprocess(
  (data) => camelize(data),
  z.object({
    creativeId: z.number().optional(),
    name: z.string(),
    concept: z.string(),
    format: z.string().optional(),
    appCode: z.string(),
    creativeNumber: z.coerce.number().nullable().optional(),
    keyMessage: z.string().nullable().optional(),
    keyMessageNumber: z.coerce.number().nullable().optional(),
    type: MediaType.optional(),
    language: z.string().nullable().optional(),
    duration: z.number().nullable().optional(),
    uploadedBy: z.string().nullable().optional(),
    s3Key: z.string().nullable().optional(),
    facebookId: z.string().nullable().optional(),
    tiktokId: z.string().nullable().optional(),
    googleId: z.string().nullable().optional(),
    createdAt: z.coerce.date().optional(),
    statuses: z.array(CreativeStatus).default([]).optional(),
    creativeUuid: z.string().nullable().optional(),
  })
);
export const CreativesSchema = z.array(CreativeSchema);

export type Creative = z.infer<typeof CreativeSchema>;
export type MediaType = z.infer<typeof MediaType>;
export type CreativeStatus = z.infer<typeof CreativeStatus>;

export const CreativeSnowflakeRawSchema = z.preprocess(
  (data) => camelize(data),
  z.object({
    CREATIVE_INTERNAL_ID: z.number().nullable().optional(),
    APP_CODE: z.string().nullable().optional(),
    DATE: z.date().nullable().optional(),
    PARTNER: z.string().nullable().optional(),
    CREATIVE: z.string().nullable().optional(),
    CREATIVE_NAME: z.string().nullable().optional(),
    CREATED_DATE: z.string().nullable().optional(),
    CREATOR: z.string().nullable().optional(),
    CREATIVE_NUMBER: z.coerce.number().nullable().optional(),
    CONCEPT: z.string().nullable().optional(),
    FORMAT: z.string().nullable().optional(),
    TYPE: z.string().nullable().optional(),
    LANGUAGE: z.string().nullable().optional(),
    KEY_MESSAGE: z.string().nullable().optional(),
    UPLOADED_BY: z.string().nullable().optional(),
    DURATION: z.number().nullable().optional(),
    TAGS: z.string().nullable().optional(),
    COST: z.number().nullable().optional(),
    APP_CODE_LEVEL_COST: z.number().nullable().optional(),
    SOV: z.number().nullable().optional(),
    COST_LAST_7D: z.number().nullable().optional(),
    APP_CODE_LEVEL_COST_LAST_7D: z.number().nullable().optional(),
    SOV_LAST_7D: z.number().nullable().optional(),
    IS_TOP_SPENDER: z.boolean().nullable().optional(),
    IS_FIRST_TIME_TOP_SPENDER: z.boolean().nullable().optional(),
    KEY_MESSAGE_NUMBER: z.coerce.number().nullable().optional(),
    FACEBOOK_ID: z.string().optional(),
    GOOGLE_ID: z.string().optional(),
    TIKTOK_ID: z.string().optional(),
    S3_KEY: z.string().optional(),
    HOOK_RATE: z.number().optional(),
    HOLD_RATE: z.number().optional(),
    IS_WINNER: z.boolean().optional(),
  })
);

export type CreativeSnowflakeRawSchema = z.infer<
  typeof CreativeSnowflakeRawSchema
>;
