import { ApiGatewayClient } from "../common/api-gateway-client";
import { KeyMessagesMapper } from "./kwartz.mapper";
import { type KeyMessagesResponse } from "./kwartz.types";
import { KeyMessagesSchema } from "@kovalee/core";

const KWARTZ_ENDPOINT = "/kwartz"

export class KwartzClient {
  constructor(private http = new ApiGatewayClient()) {}

  async fetchKeyMessages(appCode: string) {
    const response = await this.http.get({
      path: `${KWARTZ_ENDPOINT}/key-messages`,
      params: {
        appCode,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch key messages. Status: ${response.status}`);
    }
    const { keyMessages } = await response.json() as KeyMessagesResponse;
    return KeyMessagesMapper.toInternalKeyMessages(KeyMessagesSchema.parse(keyMessages));
  }
}

export const kwartzClient = new KwartzClient();