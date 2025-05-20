import { FieldSet } from "airtable";

export enum CreativeTableNames {
  CREATIVE_LIBRARY = "Creatives",
  CREATIVE_TOOL_HISTORY = "Creative tool history",
  CREATIVE_TOOL_LOGS = "Creative tool logs",
  CREATIVE_APPS = "Apps",
  CREATIVE_KEY_MESSAGE = "Key Message Matching",
  KWARTZ = "Kwartz",
}

export enum CreativeLibraryColumns {
  NAME = "Name",
  CONCEPT = "Concept",
  FORMAT = "Format",
  MANUAL_INPUT = "Manual Input",
  LIVE_APP = "LIVE APP",
  TYPE = "Type",
  LANGUAGE = "Language",
  DURATION = "Duration (s)",
  CREATIVE_NUMBER = "Creative Number",
  MEDIA_S3_KEY = "Media S3 Key",
  UPLOADED_BY = "Uploaded By",
  KEY_MESSAGE_VERSION = "Key Message Version",
  KEY_MESSAGE = "Key Message",
  COMMENTS = "Comments",
  CREATED = "Created",
  FACEBOOK_CREATIVE_ID = "Facebook Creative Id",
  TIKTOK_CREATIVE_ID = "Tiktok Creative Id",
  CREATED_BY = "Created By",
  NETWORK = "Network",
}

export enum CampaignBatchColumns {
  APP = "app",
  Network = "network",
  CAMPAIGN = "campaign",
  CAMPAIGN_ID = "campaignId",
  ADSET = "adset",
  ADSET_ID = "adsetId",
  AD = "ad",
  AD_ID = "adId",
  CREATIVE = "creative",
  CREATIVE_ID = "creativeId",
  STATUS = "status",
  IMPRESSION = "impression",
  IPM = "IPM",
  CTR = "CTR",
  CVR = "CVR",
  CPI = "CPI",
  SPEND = "spend",
  DATE_PAUSED = "datePaused",
  CREATED = "Created",
  NAME = "name",
  RESPONSIBLE = "responsible",
  ENVIRONMENT = "environment",
  FACEBOOK_CREATIVE_ID = "facebookCreativeId",
  IS_CONTROL = "isControl",
  BEATS_CONTROL = "beatsControl",
  COMMENTS = "comments",
  S3_KEY = "s3Key",
}

export interface CreativeLibraryInputAirtableFields {
  [CreativeLibraryColumns.CONCEPT]: string;
  [CreativeLibraryColumns.FORMAT]: string;
  [CreativeLibraryColumns.MANUAL_INPUT]: string;
  [CreativeLibraryColumns.LIVE_APP]: string[];
  [CreativeLibraryColumns.TYPE]: string;
  [CreativeLibraryColumns.KEY_MESSAGE_VERSION]: string;
  [CreativeLibraryColumns.KEY_MESSAGE]: string;
  [CreativeLibraryColumns.LANGUAGE]: string;
  [CreativeLibraryColumns.DURATION]: number;
  [CreativeLibraryColumns.CREATIVE_NUMBER]: string;
  [CreativeLibraryColumns.MEDIA_S3_KEY]: string;
  [CreativeLibraryColumns.UPLOADED_BY]: string;
  [CreativeLibraryColumns.FACEBOOK_CREATIVE_ID]?: string;
  [CreativeLibraryColumns.TIKTOK_CREATIVE_ID]?: string;
  [CreativeLibraryColumns.NETWORK]: string;
}

export interface CreativeLibraryOutputAirtableFields
  extends CreativeLibraryInputAirtableFields {
  [CreativeLibraryColumns.CREATED]: Date;
  [CreativeLibraryColumns.NAME]: string;
  [CreativeLibraryColumns.CREATED_BY]: { name: string };
}

export interface CampaignBatchInputAirtableFields {
  [CampaignBatchColumns.APP]: string;
  [CampaignBatchColumns.Network]: string;
  [CampaignBatchColumns.CAMPAIGN]: string;
  [CampaignBatchColumns.CAMPAIGN_ID]: string;
  [CampaignBatchColumns.ADSET]: string;
  [CampaignBatchColumns.ADSET_ID]: string;
  [CampaignBatchColumns.AD]: string;
  [CampaignBatchColumns.AD_ID]: string;
  [CampaignBatchColumns.CREATIVE_ID]: string;
  [CampaignBatchColumns.STATUS]: string;
  [CampaignBatchColumns.IMPRESSION]: number;
  [CampaignBatchColumns.IPM]: number;
  [CampaignBatchColumns.CTR]: number;
  [CampaignBatchColumns.CVR]: number;
  [CampaignBatchColumns.CPI]: number;
  [CampaignBatchColumns.SPEND]: number;
  [CampaignBatchColumns.DATE_PAUSED]?: Date;
  [CampaignBatchColumns.NAME]: string;
  [CampaignBatchColumns.RESPONSIBLE]: string;
  [CampaignBatchColumns.ENVIRONMENT]: string;
  [CampaignBatchColumns.FACEBOOK_CREATIVE_ID]: string;
  [CampaignBatchColumns.IS_CONTROL]: string;
  [CampaignBatchColumns.BEATS_CONTROL]: string;
  [CampaignBatchColumns.COMMENTS]?: string;
  [CampaignBatchColumns.S3_KEY]?: string;
}
interface CampaignBatchExcludedFields {
  [CampaignBatchColumns.DATE_PAUSED]: Date;
}

export interface CampaignBatchOutputAirtableFields
  extends Omit<
    CampaignBatchInputAirtableFields,
    keyof CampaignBatchExcludedFields
  > {
  [CampaignBatchColumns.DATE_PAUSED]: string;
  [CampaignBatchColumns.CREATED]: string;
}
export enum CreativeKeywordMessageColumns {
  KEY_MESSAGE = "Key Message",
  APP = "APP",
  KEY_MESSAGE_NUMBER = "Key Message Number",
}

export interface CreativeKeywordMessageOuputAirtableFields {
  [CreativeKeywordMessageColumns.APP]: string;
  [CreativeKeywordMessageColumns.KEY_MESSAGE]: string;
  [CreativeKeywordMessageColumns.KEY_MESSAGE_NUMBER]: number;
}

export type AirtableRow = {
  id: string;
  fields: FieldSet;
};

export type BaseName = keyof typeof CreativeTableNames;

export type BaseIds = { key: string; tableName: string };
