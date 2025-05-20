import { z } from "zod";

export const TokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  scope: z.string(),
  token_type: z.string(),
  expiry_date: z.number(),
});

export type Token = z.infer<typeof TokenSchema>;

export const EmailSchema = z.object({
  emailId: z.string(),
  sender: z.string(),
  subject: z.string(),
  body: z.string(),
  date: z.date(),
});

export type Email = z.infer<typeof EmailSchema>;

export const AccessTokenSchema = z.object({
  access_token: z.string(),
});

export const GoogleSecretSchema = z.object({
  web: z.object({
    client_id: z.string(),
    project_id: z.string(),
    auth_uri: z.string(),
    token_uri: z.string(),
    auth_provider_x509_cert_url: z.string(),
    client_secret: z.string(),
    redirect_uris: z.array(z.string()),
    javascript_origins: z.array(z.string()),
  }),
});
export const GoogleTokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  scope: z.string(),
  token_type: z.string(),
  expiry_date: z.number(),
});
export type GoogleSecret = z.infer<typeof GoogleSecretSchema>;
export type GoogleToken = z.infer<typeof GoogleTokenSchema>;
