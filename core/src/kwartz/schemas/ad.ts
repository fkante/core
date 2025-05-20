import z from "zod";

export enum BidType {
  ABSOLUTE_OCPM = "ABSOLUTE_OCPM",
}
export enum AdStatus {
  ACCEPTED = "ACCEPTED",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED",
  DISAPPROVED = "DISAPPROVED",
  DONE_FETCHING = "DONE FETCHING",
  FAILED = "FAILED",
  FETCHING = "FETCHING",
  IN_PROCESS = "IN_PROCESS",
  LIVE = "LIVE",
  LOSER = "LOSER",
  PAUSED = "PAUSED",
  PENDING_REVIEW = "PENDING REVIEW",
  UNKNOWN = "UNKNOWN",
  WINNER = "WINNER",
  WITH_ISSUES = "WITH_ISSUES",
}
export enum AppInstallState {
  NOT_INSTALLED = "not_installed",
}
export enum AdsLimit {
  DEFAULT = 50,
  GOOGLE = 40,
  GOOGLE_PER_ASSET_TYPE = 20,
}

export const AdSchema = z.object({
  account_id: z.string(),
  adset_id: z.string(),
  bid_type: z.nativeEnum(BidType),
  campaign_id: z.string(),
  configured_status: z.nativeEnum(AdStatus).catch((ctx) => {
    console.log(`Found unknown value in status: ${ctx.input}`);
    return AdStatus.UNKNOWN;
  }),
  created_time: z.string(),
  creative: z.object({
    id: z.string(),
  }),
  demolink_hash: z.string(),
  display_sequence: z.number(),
  effective_status: z.nativeEnum(AdStatus).catch((ctx) => {
    console.log(`Found unknown value in status: ${ctx.input}`);
    return AdStatus.UNKNOWN;
  }),
  engagement_audience: z.boolean(),
  id: z.string(),
  name: z.string(),
  preview_shareable_link: z.string(),
  source_ad_id: z.string(),
  status: z.nativeEnum(AdStatus).catch((ctx) => {
    console.log(`Found unknown value in status: ${ctx.input}`);
    return AdStatus.UNKNOWN;
  }),
  targeting: z.object({
    age_max: z.number(),
    age_min: z.number(),
    app_install_state: z.nativeEnum(AppInstallState),
    geo_locations: z.object({
      countries: z.array(z.string()),
    }),
    user_os: z.array(z.string()),
  }),
});

export type Ad = z.infer<typeof AdSchema>;
