import z from "zod";

import { AppSchema } from "./schemas";

export type App = z.infer<typeof AppSchema>;

export enum Squad {
  RED_SQUAD = "Red",
  BLUE_SQUAD = "Blue",
}

export function getFinalAppCode(appCode: string) {
  switch (appCode) {
    case "MRP":
      return "MRP-IOS";
    case "LWP":
      return "LWP-IOS";
    case "DCT-ANDROID":
      return "DCT-AND";
    case "DCT":
      return "DCT-IOS";
    default:
      return appCode;
  }
}
