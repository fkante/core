import {
  APIConfig,
  AppKeywords,
  AppKeywordsSchema,
  AppMetadataSchema,
  AppStoreSourceMetricsSchema,
  AppsInfoSchema,
  CategoryTagSchema,
  CurrentKeywordsSchema,
  CustomFieldFilterSchema,
  FetchConfig,
  GetUserAppSchema,
  KeywordsHistory,
  KeywordsHistorySchemaResponse,
  RatingsSchema,
  ResearchKeywordSchema,
  SalesReportIosEstimateSchema,
  TopAppsSchema,
  UserApp,
  UserAppSchema,
} from "./schemas";
import { chunk, sleep } from "../../utils";

import { Platform } from "../../definitions";
import { formatCategoryTags } from "./customTags";
import { formatDate } from "../..";
import { formatTopApps } from "./topApps";
import { getCustomFilters } from "./customFilters";
import { subDays } from "date-fns";
import z from "zod";

const SENSOR_TOWER_API_BASE_URL = "https://api.sensortower.com/v1" as const;
const SENSOR_TOWER_APP_BASE_URL = "https://app.sensortower.com/api" as const;
const SENSOR_TOWER_FIELD_CATEGORIES = [
  "app_info",
  "app_ratings",
  "app_updates",
  "downloads_and_revenue",
];
const SENSOR_TOWER_FIELDS = ["Free", "Primary Category"];

enum Endpoint {
  CUSTOM_FIELDS_FILTER = "custom_fields_filter",
  SOV = "search_ads/terms",
  RATINGS = "review/get_ratings",
  KEYWORDS = "keywords/keywords",
  KEYWORDS_HISTORY = "keywords/traffic_history",
  KEYWORDS_RESEARCH = "keywords/research_keyword",
  CURRENT_KEYWORDS = "keywords/get_current_keywords",
  SALE_REPORT_SOURCE_METRICS = "sales_reports/sources_metrics",
  SALES_REPORT_ESTIMATES = "sales_report_estimates",
  TOP_APPS = "sales_report_estimates_comparison_attributes",
  USER_APPS = "ajax/user_apps",
  VERSION_HISTORY = "/apps/version_history",
  APP_INFO = "apps",
  APP_TAG = "app_tag/tags_for_apps",
}
export class KSensortower {
  private authToken: string;
  private id: number;

  constructor(authToken: string, id: number = 1) {
    this.authToken = authToken;
    this.id = id;
  }

  private getOS(platform: Platform) {
    return platform === Platform.iOS ? "ios" : "android";
  }

  private async fetch(config: FetchConfig) {
    const {
      method,
      parameters = {},
      baseURL,
      endpoint,
      platform,
      body,
      headers,
    } = config;
    const url = this.buildUrl(baseURL, endpoint, platform, parameters);

    const isPost = method === "POST";

    const response = await fetch(url, {
      method,
      headers,
      body: isPost ? JSON.stringify(body) : undefined,
    });

    return response;
  }

  private buildUrl(
    baseURL: string,
    endpoint: string,
    platform?: Platform,
    parameters: Record<string, string> = {}
  ) {
    const platformPath = platform ? `${this.getOS(platform)}/` : "";
    const query = new URLSearchParams(parameters).toString();

    return `${baseURL}/${platformPath}${endpoint}?auth_token=${this.authToken}&${query}`;
  }

  /**
   * Call the SensorTower API
   * @param endpoint Endpoint to call
   * @param platform Platform to call the endpoint for
   * @param parameters Parameters to pass to the endpoint as an object
   * @returns Response from the API
   * @example
   * const response = await this.callAPI(
   *  Endpoint.KEYWORDS_HISTORY,
   * platform,
   * params
   * );
   **/
  async callAPI(config: APIConfig) {
    console.log(`API call ${config.endpoint} with API key ${this.id}`);
    return this.fetch({ baseURL: SENSOR_TOWER_API_BASE_URL, ...config });
  }

  async callApp(
    config: APIConfig,
    appId: number | null = null
  ): Promise<Response> {
    console.log(`App call ${config.endpoint} with API key ${this.id}`);

    const endpoint = appId ? `${config.endpoint}/${appId}` : config.endpoint;
    const finalConfig = {
      baseURL: SENSOR_TOWER_APP_BASE_URL,
      ...config,
      endpoint: endpoint,
    };

    const response = await this.fetch(finalConfig);

    if (response.status !== 200) {
      console.log(
        `[${response.status}] Failed to call ${config.endpoint} with API key ${this.id}`
      );
      console.log("Sleeping...");
      await sleep(60000);
      return this.callApp(finalConfig);
    }
    return response;
  }

  /**
   * This retrieves the share of voice (called sov which is only available on IOS)
   * for an app listed by its current ad terms for a specific date range
   * @param config - The config query for the SOV
   * @param config.appID sensor towers numeric (NOT the alphanumeric id) id for the desired app
   * @param [config.startDate] the start/from date for the date range
   * @param [config.endDate] the end/to date for the date range
   * @param [config.country="US"] the country to rate the SOV for. We currently only do US
   */
  async getSOVPerTerm(config: {
    appID: string;
    startDate?: Date;
    endDate?: Date;
    country?: string;
  }): Promise<Record<string, number>> {
    const { appID, startDate, endDate, country } = config;
    // for defaults
    const now = new Date();
    const oneDayInMS = 24 * 60 * 60 * 1000;
    const minusOne = new Date(now.getTime() - oneDayInMS * 1);
    const minusFour = new Date(now.getTime() - oneDayInMS * 3);

    const formattedStartDate = formatDate(startDate ?? minusFour);
    const formattedEndDate = formatDate(endDate ?? minusOne);

    const query = {
      app_id: appID,
      country: country ?? "US",
      start_date: formattedStartDate,
      end_date: formattedEndDate,
    };
    const response = await this.callAPI({
      endpoint: Endpoint.SOV,
      platform: Platform.iOS,
      parameters: query,
    });
    const jsonBody = await response.json();
    const data = z
      .object({
        terms: z.array(
          z.object({ term: z.string(), share_of_voice: z.number() })
        ),
      })
      .parse(jsonBody);

    const shareOfVoice: Record<string, number> = {};
    for (const term of data.terms) {
      shareOfVoice[term.term] = term.share_of_voice;
    }
    return shareOfVoice;
  }

  async getCurrentKeywords(
    appId: string,
    platform: Platform = Platform.iOS,
    country = "US"
  ) {
    const parameters = {
      app_id: appId,
      countries: country,
    };
    const response = await this.callAPI({
      endpoint: Endpoint.CURRENT_KEYWORDS,
      platform,
      parameters,
    });

    const json = await response.json();
    const jsonParsed = CurrentKeywordsSchema.parse(json);

    return jsonParsed;
  }

  async getRatings(platform: Platform, appId: string, country = "US") {
    const isIOS = platform === Platform.iOS;
    const countryParameter = isIOS ? `&country=${country}` : "";

    const parameters = {
      app_id: appId,
      country: countryParameter,
    };
    const response = await this.callAPI({
      endpoint: Endpoint.RATINGS,
      platform,
      parameters,
    });
    const json = await response.json();
    const jsonParsed = RatingsSchema.parse(json);

    return jsonParsed;
  }

  async getAppStoreSourcesMetrics({
    appId,
    countries,
    startDate,
    endDate,
  }: {
    appId: string;
    countries?: string[];
    startDate: Date;
    endDate: Date;
  }) {
    const parameters = {
      app_id: appId,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
    };
    const parametersWithCountries = countries
      ? {
          ...parameters,
          countries: countries.join(","),
        }
      : parameters;
    const response = await this.callAPI({
      endpoint: Endpoint.SALE_REPORT_SOURCE_METRICS,
      platform: Platform.iOS,
      parameters: parametersWithCountries,
    });

    const json = await response.json();
    const jsonParsed = AppStoreSourceMetricsSchema.parse(json);

    return jsonParsed;
  }

  /*
    Get tracked keywords for an app
  */
  async getAppKeywords(
    appId: string,
    country = "US",
    platform: Platform
  ): Promise<AppKeywords> {
    const parameters = {
      user_app_id: appId,
      device: "phone",
      country,
    };
    const response = await this.callAPI({
      endpoint: Endpoint.KEYWORDS,
      platform,
      parameters,
    });

    const json = await response.json();
    const jsonParsed = AppKeywordsSchema.parse(json);

    return jsonParsed;
  }

  async getKeywordInformation(
    appId: string,
    keyword: string,
    country = "US",
    platform: Platform = Platform.iOS
  ) {
    const parameters = {
      term: keyword,
      app_id: appId,
      country,
    };
    const response = await this.callAPI({
      endpoint: Endpoint.KEYWORDS_RESEARCH,
      platform,
      parameters,
    });

    const json = await response.json();
    const jsonParsed = ResearchKeywordSchema.parse(json);

    return jsonParsed;
  }

  async addUserApp(appId: string | number): Promise<UserApp> {
    const body = {
      app_id: appId,
      current_product: "aso",
      os: "ios",
    };
    const response = await this.callApp({
      endpoint: "app_intel/user_apps",
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();
    const userApp = z.object({ user_app: UserAppSchema }).parse(json).user_app;
    return userApp;
  }

  async deleteUserApp(appId: string) {
    const response = await this.callApp({
      endpoint: `app_intel/user_apps/${appId}`,
      parameters: { os: "ios" },
      method: "DELETE",
    });

    const json = await response.json();
    return json;
  }

  async getUserApps() {
    const response = await this.callAPI({
      endpoint: Endpoint.USER_APPS,
      platform: Platform.iOS,
    });
    const json = await response.json();
    const { user_apps: userApps } = GetUserAppSchema.parse(json);
    return userApps;
  }

  async addKeywordsToUserApp({
    userAppId,
    countryCode,
    keywords,
  }: {
    userAppId: string;
    countryCode: string;
    keywords: string[];
  }) {
    const body = {
      user_app_id: userAppId,
      terms: keywords,
      country: countryCode.toUpperCase(),
      tab_id: null,
    };
    const response = await this.callApp({
      endpoint: "keywords/lookup",
      platform: Platform.iOS,
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await response.json();

    const jsonParsed = z
      .object({ success: z.boolean().optional() })
      .parse(json);
    if (!jsonParsed.success) {
      console.log(json);
      throw new Error(
        `Failed to add keywords to user app: ${userAppId} to ${countryCode}`
      );
    }
    return jsonParsed;
  }

  private async _createCustomFieldsFilters(country: string) {
    const customFilters = await getCustomFilters(country);

    const response = await this.callAPI({
      endpoint: Endpoint.CUSTOM_FIELDS_FILTER,
      method: "POST",
      body: customFilters,
      headers: { "Content-Type": "application/json" },
    });

    const json = await response.json();

    const filterId =
      CustomFieldFilterSchema.parse(json).custom_fields_filter_id;
    return filterId;
  }

  async getTopApps({
    platform,
    country,
    category,
  }: {
    platform: Platform;
    country: string;
    category: string | number;
  }) {
    const customFilterId = await this._createCustomFieldsFilters(country);
    const parameters = {
      comparison_attribute: "absolute",
      category: category.toString(),
      country,
      time_range: "day",
      measure: "units",
      date: formatDate(subDays(new Date(), 30)),
      limit: "2000",
      device_type: "total",
      custom_fields_filter_id: customFilterId,
    };

    const response = await this.callAPI({
      endpoint: Endpoint.TOP_APPS,
      platform,
      parameters,
    });
    const json = await response.json();
    const topApps = TopAppsSchema.parse(json);

    const formattedTopApps = formatTopApps(topApps);

    return formattedTopApps;
  }

  async getAppCustomTagInfo({ appIds }: { appIds: number[] }) {
    const parameters = {
      app_ids: `${appIds.join(",")}`,
      field_categories: SENSOR_TOWER_FIELD_CATEGORIES.join(","),
      fields: SENSOR_TOWER_FIELDS.join(","),
    };

    const response = await this.callAPI({
      endpoint: Endpoint.APP_TAG,
      parameters,
    });

    const json = await response.json();

    const categoryTag = CategoryTagSchema.parse(json);

    const formattedCategoryTags = formatCategoryTags(categoryTag.data);

    return formattedCategoryTags;
  }

  async getKeywordHistory(
    keywords: string[],
    countries: string[] = ["US"],
    startDate: Date,
    endDate: Date,
    dateGranularity: "weekly" | "monthly",
    platform: Platform
  ): Promise<KeywordsHistory> {
    try {
      const chunks = chunk(keywords, 25);
      let results = {};

      for (let i = 0; i < chunks.length; i++) {
        const parameters = {
          terms: chunks[i].join(","),
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          countries: countries.join(","),
          date_granularity: dateGranularity,
        };

        const response = await this.callAPI({
          endpoint: Endpoint.KEYWORDS_HISTORY,
          platform,
          parameters,
        });
        const json = await response.json();
        const jsonParsed = KeywordsHistorySchemaResponse.parse(json);

        if (jsonParsed.errors) {
          console.log(
            `[getKeywordHistory] Error: ${jsonParsed.errors[0]?.title}`
          );
        }

        results = { ...results, ...jsonParsed.terms } as KeywordsHistory;
      }

      return results;
    } catch (error: unknown) {
      console.log(error);
      return {};
    }
  }

  async getIosAppSalesReportEstimates({
    appId,
    countries,
    startDate,
    endDate,
    dateGranularity,
  }: {
    appId: number[];
    countries?: string[];
    startDate: Date;
    endDate: Date;
    dateGranularity: "weekly" | "monthly";
  }) {
    const parameters = {
      app_id: appId.join(","),
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      date_granularity: dateGranularity,
    };
    const parametersWithCountries = countries
      ? {
          ...parameters,
          countries: countries.join(","),
        }
      : parameters;

    const response = await this.callAPI({
      endpoint: Endpoint.SALES_REPORT_ESTIMATES,
      platform: Platform.iOS,
      parameters: parametersWithCountries,
    });

    const json = await response.json();
    const jsonParsed = SalesReportIosEstimateSchema.parse(json);

    return jsonParsed;
  }

  async getAppInfo({ appIds, country }: { appIds: number[]; country: string }) {
    const parameters: Record<string, string> = {
      app_ids: appIds.join(","),
      country,
    };

    const response = await this.callAPI({
      endpoint: Endpoint.APP_INFO,
      platform: Platform.iOS,
      parameters: parameters,
    });

    const json = await response.json();
    const jsonParsed = AppsInfoSchema.parse(json);

    return jsonParsed;
  }

  async fetchAppMetadata(appId: number) {
    const response = await this.callApp(
      {
        endpoint: Endpoint.APP_INFO,
        platform: Platform.iOS,
        method: "GET",
        parameters: {
          country: "US",
        },
        headers: {
          "Content-Type": "application/json",
        },
      },
      appId
    );

    const json = await response.json();

    const jsonParsed = AppMetadataSchema.parse(json);

    return jsonParsed;
  }
}
