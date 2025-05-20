import { z } from "zod";

export const AdjustTypeOfChangeEnum = z.enum(["bid", "daily_budget"]);
export const AdjustChangeStatusEnum = z.enum(["success", "failed", "pending"]);
export type AdjustChangeStatus = z.infer<typeof AdjustChangeStatusEnum>;

const AdjustHistoryChangeSchema = z.object({
  id: z.number(),
  attribute_slug: AdjustTypeOfChangeEnum,
  targeting: z.object({
    partner: z.string(),
    adgroup_id_network: z.string().optional(),
    campaign_id_network: z.string(),
    creative_id_network: z.string().optional(),
    adgroup_network: z.string().optional(),
    campaign_network: z.string().optional(),
    creative_network: z.string().optional(),
    country_code: z.string().optional(),
    source_id_network: z.string().optional(),
  }),
  value_to: z.object({
    amount: z.preprocess((arg) => {
      return Number(arg);
    }, z.number()),
  }),
  value_from: z
    .object({
      amount: z.preprocess((arg) => {
        return Number(arg);
      }, z.number()),
    })
    .nullable(),
  status: z.string(),
});

export const AdjustHistoryChangesSchema = z.array(AdjustHistoryChangeSchema);

export type AdjustHistoryChange = z.infer<typeof AdjustHistoryChangeSchema>;
