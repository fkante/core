import z from "zod";

import { camelize } from "../..";
import { CampaignSchema } from "./campaign";
import { CreativeSchema, CreativesSchema } from "./creative";

export const LaunchpadStatus = z.enum([
  "error",
  "pending",
  "processing",
  "refused",
  "success",
]);
export type LaunchpadStatus = z.infer<typeof LaunchpadStatus>;
export const LaunchpadSchema = z.preprocess(
  (data) => camelize(data),
  z.object({
    adsetId: z.string().nullable().optional(),
    adsetName: z.string().nullable().optional(),
    appCode: z.string(),
    campaign: CampaignSchema.optional(),
    campaignId: z.string().nullable().optional(),
    campaignName: z.string().nullable().optional(),
    completedAt: z.coerce.date().nullable().optional(),
    controlCreativeId: z.number().nullable().optional(),
    controlCreative: CreativeSchema.optional(),
    creativeIds: z.array(z.number()).nullable().optional(),
    creatives: CreativesSchema.optional(),
    entityId: z.string().nullable().optional(),
    entityName: z.string().nullable().optional(),
    failureCount: z.number().default(0).optional(),
    id: z.number().optional(),
    lastRetryAt: z.coerce.date().nullable().optional(),
    network: z.string().nullable().optional(),
    status: LaunchpadStatus.default("pending"),
    updatedAt: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
    updatedBy: z.string().nullable().optional(),
    createdAt: z.coerce.date().default(() => new Date()),
    uploadedBy: z.string(),
    validatedAt: z.coerce.date().nullable().optional(),
    validatedBy: z.string().nullable().optional(),
  })
);

export type Launchpad = z.infer<typeof LaunchpadSchema>;
