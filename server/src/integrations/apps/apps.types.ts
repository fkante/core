import { AppSchema, camelize } from "@kovalee/core";

import { z } from "zod";

// Only keep the field we need and which are not sensitive
export interface App {
  code: string;
  icon: string | null;
  banner: string | null;
  name: string;
  os: string;
  squad: string;
  storeUrl: string;
  vertical: string;
  description: string;
}

// Not sure why the response is not typed
export interface AppsResponse {
  apps: unknown;
}

// Kommander clearly need a refacto
export const AppSchemaWithoutCode = z.preprocess((data: unknown) =>{
  return camelize(data)
}, AppSchema._def.schema.omit({
  code: true,
}))

