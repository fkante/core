import { z } from "zod";

import { SlackNotification } from "./schemas";

const BASE_URL = "https://slack-app-bejj.onrender.com" as const;

// use https://api.slack.com/methods/conversations.list to get it
export enum KnownChannelIDs {
  BLUE_CREA_READY = "C0684JYJ553",
  BLUE_SQUAD = "C04J8BBLND8",
  CREATIVE_TOOL_REPORTING = "C03S3N9HE3X",
  CRON_STATUS = "C036HH6NL86",
  DATA_CHECK = "C049MCQP344",
  DEFAULT_CHANNEL_NAME = "test",
  KARBON_LOGS = "C065WJWCC3W",
  KOBALT_LOGS = "C03BHNJKG7M",
  KROME_LOGS = "C06F4GEV30X",
  KROME_TECH = "C064S9TLZKK",
  RED_CREA_READY = "C068L6311L1",
  RED_SQUAD = "C04J7UF9WKG",
  SERVER_LOGS = "C0375CBGTPS",
  SONAR_LOGS = "C03MMFLNZV1",
  TEST = "C01AH9C25SP",
  TECH_GENERAL = "C02KE9K0TGT",
  KREATIVE_AI_LOGS = "C07SVATGSPP",
  KWARTZ_LOGS = "C08JMPFCPT2",
}
export type ChannelId = string | KnownChannelIDs;

export interface SlackMessage {
  text: string;
  ts: string;
  attachments?: z.infer<typeof SlackNotification>["attachments"];
}

export enum SlackTool {
  CREATIVE_TOOL = "Kwartz",
  CRON = "Cron Status",
  RAW_DATA = "Raw Data",
  PARQUET = "Parquet",
  RENDER = "Render",
  KOBALT = "Kobalt",
  KROME = "Krome",
  SONAR = "Sonar",
  APP_BUILD_UPDATE = "Build Update",
  KREATIVE_AI = "Kreative-AI",
}

export class KSlack {
  private appToken: string;
  private baseUrl: string;
  constructor(appToken: string, baseUrl: string = BASE_URL) {
    this.appToken = appToken;
    this.baseUrl = baseUrl;
  }

  async sendMessage(
    payload: SlackNotification,
    options: { addEmoji: boolean } = { addEmoji: true }
  ) {
    try {
      const response = await fetch(
        `${this.baseUrl}/notify?emoji=${options.addEmoji}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.appToken}`,
          },
        }
      );
      return response;
    } catch (error: unknown) {
      console.log(`Error sending Slack message: ${(error as Error).message}`);
    }
  }
}
