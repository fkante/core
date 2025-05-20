import z from "zod";

import { AdsetsSchema } from "./adset";

export const CampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  network: z.string(),
  customerId: z.string().nullable(),
  updatedAt: z.coerce.date().optional(),
  adsets: AdsetsSchema,
});
export const CampaignsSchema = z.record(CampaignSchema);

export type Campaign = z.infer<typeof CampaignSchema>;
export type Campaigns = z.infer<typeof CampaignsSchema>;
