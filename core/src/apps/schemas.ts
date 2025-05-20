import { camelize } from "..";
import z from "zod";

export const MaturityEnum = z.enum([
  "nurturing1",
  "nurturing2",
  "scaling1",
  "scaling2",
  "mature1",
  "mature2",
]);

export const MaturitySchema = z.object({
  value: MaturityEnum,
  createdAt: z.coerce.date(),
});
export type Maturity = z.infer<typeof MaturitySchema>;
export type MaturityValue = z.infer<typeof MaturityEnum>;

export const GateEnum = z.enum(["gate0", "gate1", "gate2", "gate3"]);
export const GateSchema = z.object({
  value: GateEnum,
  createdAt: z.coerce.date(),
});
export type Gate = z.infer<typeof GateSchema>;
export type GateValue = z.infer<typeof GateEnum>;

export const AppSchema = z.preprocess(
  (data) => camelize(data),
  z.object({
    adjustToken: z.string().nullable(),
    amplitudeBucketName: z.string().nullable(),
    amplitudeProjectId: z.string().nullable(),
    amplitudeProdApiKey: z.string().nullable(),
    appCode: z.string(),
    appIcon: z.string().nullable(),
    appBanner: z.string().nullable().optional(),
    appName: z.string(),
    appOs: z.string(),
    appSecretKey: z.string().nullable(),
    appleAccount: z.string().nullable(),
    appleAppId: z.string().nullable(),
    appleTeamId: z.string().nullable(),
    asaOrgId: z.string().nullable(),
    bucketName: z.string().nullable(),
    bundleId: z.string().nullable(),
    createdAt: z.coerce.date(),
    deleted: z.coerce.date().nullable(),
    facebookAdAccountId: z.string().nullable(),
    facebookApplicationId: z.string().nullable(),
    googleAnalyticsPropertyId: z.string().nullable(),
    notionBuildTableId: z.string().nullable(),
    programmingLanguage: z.string().nullable(),
    revenuecatBucketName: z.string().nullable(),
    revenuecatFolderName: z.string().nullable(),
    revenuecatSdkKey: z.string().nullable(),
    sensortower: z.string().nullable(),
    signed: z.boolean(),
    squad: z.string().nullable(),
    storeUrl: z.string().nullable(),
    vertical: z.string(),
    studio: z.boolean(),
    code: z.string(),
    displayName: z.string().optional(),
    revenueCatBucketName: z.string().nullable().optional(),
    revenueCatFolderName: z.string().nullable().optional(),
    appleStoreConnectApiKey: z.string().nullable().optional(),
    googleCustomerIds: z.array(z.string()).nullable().optional(),
    gmp: z.number(),
    botToken: z.string().nullable().optional(),
    notionUrl: z.string().nullable(),
    amplitudeUrl: z.string().nullable(),
    maturity: MaturitySchema.nullable(),
    gate: GateSchema.nullable(),
    appDescription: z.string().nullable().optional(),
  })
);
export const AppsSchema = z.array(AppSchema);

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
