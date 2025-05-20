import { COMMITEEID, PRECOMMITEEID } from "./constant";

import { z } from "zod";

export const HubspotAPIConfigSchema = z.object({
  endpoint: z.string(),
  parameters: z.record(z.string()).optional(),
  method: z
    .union([z.literal("GET"), z.literal("POST"), z.literal("DELETE")])
    .optional(),
  body: z.record(z.unknown()).optional(),
  headers: z.record(z.string()).optional(),
});
export type HubspotAPIConfig = z.infer<typeof HubspotAPIConfigSchema>;

export const HubspotFetchConfigSchema = HubspotAPIConfigSchema;
export type HubspotFetchConfig = z.infer<typeof HubspotFetchConfigSchema>;

export const PropertiesSchema = z.object({
  amount: z.string().nullable(),
  dealname: z.string(),
  dealstage: z.string().nullable(),
  hs_object_id: z.string(),
  pipeline: z.string().nullable(),
});

export const DealSchema = z.object({
  id: z.string(),
  properties: PropertiesSchema,
});

export const PagingSchema = z.object({
  next: z
    .object({
      after: z.string(),
      link: z.string(),
    })
    .optional(),
});

export const FecthDealResponseSchema = z.object({
  results: z.array(DealSchema),
  paging: PagingSchema.optional(),
});

export type Deal = z.infer<typeof DealSchema>;

const associationTypeSchema = z.object({
  associationCategory: z.enum(["HUBSPOT_DEFINED"]),
  associationTypeId: z.number().int(),
});

const associationSchema = z.object({
  to: z.object({
    id: z.number().int(),
  }),
  types: z.array(associationTypeSchema),
});

const lifecyclyeStageSchema = z
  .enum([
    "subscriber",
    "lead",
    "marketingqualifiedlead",
    "salesqualifiedlead",
    "opportunity",
    "customer",
    "evangelist",
    "other",
  ])
  .default("opportunity");

export const CompanyPropertySchema = z
  .object({
    name: z.string(),
    lifecyclestage: lifecyclyeStageSchema,
  })
  .passthrough();

const CompanySchema = z.object({
  properties: CompanyPropertySchema,
  associations: z.array(associationSchema).optional(),
});

export type CompanyBody = z.infer<typeof CompanySchema>;

const DealPropertiesSchema = z
  .object({
    dealname: z.string(),
    pipeline: z.string().optional().default("Sales"),
    dealstage: z.enum([
      "appointmentscheduled",
      "qualifiedtobuy",
      "presentationscheduled",
      "decisionmakerboughtin",
      "contractsent",
      "Pre Committe",
      "closedwon",
      "closedlost",
      COMMITEEID,
      PRECOMMITEEID,
    ]),
    hubspot_owner_id: z.string(),
  })
  .passthrough();

const DealBodySchema = z.object({
  properties: DealPropertiesSchema,
  associations: z.array(associationSchema),
});

export type DealBody = z.infer<typeof DealBodySchema>;

const ContactPropertiesSchema = z
  .object({
    email: z.string().email(),
    company: z.string(),
    lifecyclestage: lifecyclyeStageSchema,
  })
  .passthrough();

const ContactBodySchema = z.object({
  properties: ContactPropertiesSchema,
  associations: z.array(associationSchema).optional(),
});

export type ContactBody = z.infer<typeof ContactBodySchema>;

const propertiesSchema = z.record(z.any());

export const HubspotObjectResponseSchema = z.object({
  id: z.string(),
  properties: propertiesSchema,
});

export type HubspotObjectResponse = z.infer<typeof HubspotObjectResponseSchema>;

export const resultSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.string().optional(),
  fieldType: z.string().optional(),
  description: z.string().optional(),
  groupName: z.string().optional(),
  options: z.array(z.any()),
  displayOrder: z.number().optional(),
  calculated: z.boolean().optional(),
  externalOptions: z.boolean().optional(),
  hasUniqueValue: z.boolean().optional(),
  hidden: z.boolean().optional(),
  hubspotDefined: z.boolean().optional(),
  modificationMetadata: z.any(),
  formField: z.boolean().optional(),
  dataSensitivity: z.enum(["non_sensitive", "sensitive"]).optional(),
  createdUserId: z.string().optional(),
  updatedUserId: z.string().optional(),
  showCurrencySymbol: z.boolean().optional(),
});

export const ObjectTypePropertiesSchema = z.object({
  results: z.array(resultSchema),
});

export type ObjectTypeProperties = z.infer<typeof ObjectTypePropertiesSchema>;
