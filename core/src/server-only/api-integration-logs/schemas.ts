import z from "zod";

import { camelize } from "../../camelize";

export const RequestLogSchema = z.preprocess(
  (data) => camelize(data),
  z.object({
    requestId: z.string().optional(),
    tool: z.string(),
    scope: z.string(),
    network: z.string(),
    requestName: z.string(),
    requestType: z.string(),
    status: z.string().nullable(),
    responseCode: z.number().nullable(),
    responseBody: z.string().nullable(),
    responseTimeMs: z.number().nullable(),
    severity: z.string().nullable(),
    createdAt: z.string().optional(),
  })
);

export const RequestTypeEnum = z.enum(["GET", "POST", "PUT", "DELETE"]);
export const ResponseStatusEnum = z.enum(["SUCCESS", "ERROR", "WARNING"]);
export const SeverityEnum = z.enum(["LOW", "MINOR", "MAJOR", "CRITICAL"]);
export type RequestType = z.infer<typeof RequestTypeEnum>;
export type ResponseStatus = z.infer<typeof ResponseStatusEnum>;
export type Severity = z.infer<typeof SeverityEnum>;
export type RequestLog = z.infer<typeof RequestLogSchema>;
