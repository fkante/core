import z from "zod";

export const AdsetSchema = z.object({
  id: z.string(),
  name: z.string(),
  dailyBudget: z.number(),
  country: z.string(),
  platform: z.preprocess(
    (value) => String(value).split(","),
    z.array(z.string())
  ),
  adNumber: z.number(),
  images: z.number().nullable(),
  videos: z.number().nullable(),
  updatedAt: z.coerce.date().optional(),
});
export const AdsetsSchema = z.record(AdsetSchema);

export type Adset = z.infer<typeof AdsetSchema>;
export type Adsets = z.infer<typeof AdsetsSchema>;
