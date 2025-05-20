import z from "zod";

export const UA_EMAIL_RECIPIENTS = [
  "ua@kovalee.app",
  "ds@kovalee.app",
  "fk@kovalee.app",
];
export enum Platform {
  iOS = "ios",
  Android = "and",
}
export enum Tool {
  KROME = "krome",
  KARBON = "karbon",
  GLOBAL_BUDGET = "global-budget",
  AB_TEST = "ab-test",
  KWARTZ = "kwartz",
  KOBALT = "kobalt",
  SONAR = "sonar",
}

// TODO: remove this when we use google auth and use the name from the google profile
export const INITIALS_TO_NAME = {
  "a.robertson": "Albonnie",
  aj: "Abhishek",
  al: "Ashref",
  ap: "Axel",
  aro: "Albonnie",
  ds: "Damien",
  en: "Etienne",
  fk: "Francis",
  hb: "Heba",
  ska: "Syma",
  mot: "Marcela",
};

export const AppleStoreApiKeySchema = z.object({
  key_id: z.string(),
  issuer_id: z.string(),
  key: z.string(),
});

export const AuthenticatedUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  lastName: z.string(),
  firstName: z.string(),
  avatar: z.string().url(),
  initials: z.string(),
});

export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
