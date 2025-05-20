import { createQueryString } from "..";
import { Tool } from "../../definitions";
import { RequestLog, RequestLogSchema, RequestType } from "./schemas";

const BASE_URL = process.env.SERVER_BASE_URL || "http://localhost:4000";

export function createRequestObject({
  tool,
  scope,
  network,
  requestName,
  requestType,
  status,
  responseCode,
  responseBody,
  responseTimeMs,
  severity,
}: {
  tool: Tool;
  scope: string;
  network: string;
  requestName: string;
  requestType: RequestType;
  status?: string;
  responseCode?: number;
  responseBody?: string | null;
  responseTimeMs?: number;
  severity?: string;
}): RequestLog {
  return {
    tool,
    scope,
    network,
    requestName,
    requestType,
    status: status || null,
    responseCode: responseCode || null,
    responseBody: responseBody || null,
    responseTimeMs: responseTimeMs || null,
    severity: severity || null,
  };
}

export async function getRequests({
  tool,
  scope,
}: {
  tool?: string;
  scope?: string;
} = {}) {
  const queryString = createQueryString({ tool, scope });
  const response = await fetch(
    `${BASE_URL}/api-integration-logs/requests` + queryString
  );
  const rawData = await response.json();
  if (!rawData.requests) {
    throw new Error("Requests not found");
  }
  const requests = RequestLogSchema.parse(rawData.requests);
  return requests;
}

export async function logRequest(request: RequestLog) {
  try {
    const url = `${BASE_URL}/api-integration-logs/requests`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
  } catch (error) {
    console.error("Error while logging requests", error);
  }
}
