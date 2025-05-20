import { Platform } from "../../definitions";
import { z } from "zod";

const PlatformEnum = z.nativeEnum(Platform);
type PlatformEnum = z.infer<typeof PlatformEnum>;

export const APIConfigSchema = z.object({
  endpoint: z.string(),
  platform: PlatformEnum.optional(),
  parameters: z.record(z.string()).optional(),
  method: z
    .union([z.literal("GET"), z.literal("POST"), z.literal("DELETE")])
    .optional(),
  body: z.record(z.unknown()).optional(),
  headers: z.record(z.string()).optional(),
});
export type APIConfig = z.infer<typeof APIConfigSchema>;

export const fetchConfigSchema = APIConfigSchema.extend({
  baseURL: z.string(),
});
export type FetchConfig = z.infer<typeof fetchConfigSchema>;

export enum SensorTowerKpis {
  PUBLISHER_COUNTRY = "Publisher Country",
  ST_TAXONOMY = "ST Taxonomy",
  IOS_APP_FILE_SIZE = "iOS App File Size",
  EARLIEST_RELEASE_DATE = "Earliest Release Date",
  CURRENT_US_RATING = "Current US Rating",
  GLOBAL_RATING_COUNT = "Global Rating Count",
  MOST_POPULAR_COUNTRY_BY_DOWNLOADS = "Most Popular Country by Downloads",
  AVG_APP_UPDATE_FREQUENCY = "Avg. App Update Frequency",
  LATEST_UPDATE_DAYS_AGO = "Latest Update Days Ago",
  ALL_TIME_DOWNLOADS_WW = "All Time Downloads (WW)",
  ALL_TIME_REVENUE_WW = "All Time Revenue (WW)",
  LAST_30_DAYS_DOWNLOADS_WW = "Last 30 Days Downloads (WW)",
  LAST_30_DAYS_REVENUE_WW = "Last 30 Days Revenue (WW)",
  LAST_180_DAYS_DOWNLOADS_WW = "Last 180 Days Downloads (WW)",
  LAST_180_DAYS_REVENUE_WW = "Last 180 Days Revenue (WW)",
  ABSOLUTE_DOWNLOADS = "Absolute (Downloads)",
  CHANGE_DOWNLOADS = "Change (Downloads)",
  CHANGE_RATIO_DOWNLOADS = "Change Ratio (Downloads)",
  ABSOLUTE_REVENUE = "Absolute (Revenue)",
  CHANGE_REVENUE = "Change (Revenue)",
  CHANGE_RATIO_REVENUE = "Change Ratio (Revenue)",
}

export const AppStoreSourceMetricsSchema = z.array(
  z.object({
    app_id: z.number(),
    app_impressions_by_app_store_search: z.number(),
    app_units_by_app_store_search: z.number(),
    country: z.string().optional(),
    date: z.string(),
  })
);

export const CurrentKeywordsSchema = z.object({
  keywords: z.array(
    z.object({
      term: z.string(),
      rank: z.number(),
    })
  ),
  unfiltered_keywords: z.array(
    z.object({
      term: z.string(),
      rank: z.number(),
    })
  ),
});

export const RatingsSchema = z.array(
  z.object({
    app_id: z.union([z.string(), z.number()]),
    country: z.string(),
    date: z.string(),
    breakdown: z.array(z.number()),
    current_version_breakdown: z.array(z.number()).optional(),
    average: z.number(),
    total: z.number(),
  })
);

/*************************************************************/
/***************** USER APPS *********************************/
/*************************************************************/

export const UserAppSchema = z.object({
  appId: z.coerce.string(),
  country: z.string(),
  downloadsLastMonth: z.string(),
  iconUrl: z.string(),
  id: z.string(),
  credentialStatus: z.string(),
  appName: z.string(),
  os: z.string(),
  possibleNames: z.array(z.string()),
  publisherId: z.coerce.string(),
  publisherName: z.string(),
  validCountries: z.array(z.string()),
  appAdminEmail: z.string().nullable().optional(),
  isAppAdmin: z.boolean().nullable().optional(),
  isTeamMember: z.boolean().optional(),
  teamMembers: z.array(z.string()).optional(),
  itunesConnectEnabled: z.boolean().optional(),
  keywordsInCountriesToShow: z.object({}).optional(),
  numTerms: z.number().optional(),
  optimizedKeywordHistory: z.array(z.string()).optional(),
  optimizedKeywordString: z.string().optional(),
  publicAppViewUrl: z.string().optional(),
  suppressedCountries: z.array(z.string()).optional(),
  trackedCompetitors: z.array(z.string()).optional(),
  translatedString: z.string().optional(),
  translateKeywordHistory: z.array(z.string()).optional(),
  subtitle: z.string().nullable().optional(),
});

export type UserApp = z.infer<typeof UserAppSchema>;

export const GetUserAppSchema = z.object({
  user_apps: z.array(UserAppSchema),
});

export const CategoryIdsSchema = z.object({
  category_ids: z.object({
    ios: z.record(z.string()),
    android: z.record(z.string()),
  }),
});

export const CountryIdsSchema = z.object({
  country_ids: z.record(z.string()),
});

export const CustomFieldFilterSchema = z.object({
  custom_fields_filter_id: z.string(),
});

/*************************************************************/
/***************** TOP APPS **********************************/
/*************************************************************/

export const TopAppsSchema = z.array(
  z.object({
    app_id: z.number(),
    current_units_value: z.number(),
    comparison_units_value: z.number(),
    units_absolute: z.number(),
    units_delta: z.number(),
    units_transformed_delta: z.number(),
    current_revenue_value: z.number(),
    comparison_revenue_value: z.number(),
    revenue_absolute: z.number(),
    revenue_delta: z.number(),
    revenue_transformed_delta: z.number(),
    custom_tags: z.record(z.string()),
  })
);

export type TopApps = z.infer<typeof TopAppsSchema>;

export const TopAppSchema = z.object({
  app_id: z.number(),
  [SensorTowerKpis.ABSOLUTE_DOWNLOADS]: z.number().optional(),
  [SensorTowerKpis.CHANGE_DOWNLOADS]: z.number().optional(),
  [SensorTowerKpis.CHANGE_RATIO_DOWNLOADS]: z.number().optional(),
  [SensorTowerKpis.ABSOLUTE_REVENUE]: z.number().optional(),
  [SensorTowerKpis.CHANGE_REVENUE]: z.number().optional(),
  [SensorTowerKpis.CHANGE_RATIO_REVENUE]: z.number().optional(),
  [SensorTowerKpis.PUBLISHER_COUNTRY]: z.string().optional(),
  [SensorTowerKpis.ST_TAXONOMY]: z.string().optional(),
  [SensorTowerKpis.IOS_APP_FILE_SIZE]: z.string().optional(),
  [SensorTowerKpis.EARLIEST_RELEASE_DATE]: z.string().optional(),
  [SensorTowerKpis.CURRENT_US_RATING]: z.string().optional(),
  [SensorTowerKpis.GLOBAL_RATING_COUNT]: z.string().optional(),
  [SensorTowerKpis.MOST_POPULAR_COUNTRY_BY_DOWNLOADS]: z.string().optional(),
  [SensorTowerKpis.AVG_APP_UPDATE_FREQUENCY]: z.string().optional(),
  [SensorTowerKpis.LATEST_UPDATE_DAYS_AGO]: z.string().optional(),
  [SensorTowerKpis.ALL_TIME_DOWNLOADS_WW]: z.string().optional(),
  [SensorTowerKpis.ALL_TIME_REVENUE_WW]: z.string().optional(),
  [SensorTowerKpis.LAST_30_DAYS_DOWNLOADS_WW]: z.string().optional(),
  [SensorTowerKpis.LAST_30_DAYS_REVENUE_WW]: z.string().optional(),
  [SensorTowerKpis.LAST_180_DAYS_DOWNLOADS_WW]: z.string().optional(),
  [SensorTowerKpis.LAST_180_DAYS_REVENUE_WW]: z.string().optional(),
});

export type TopApp = z.infer<typeof TopAppSchema>;

/*************************************************************/
/***************** KEYWORDS **********************************/
/*************************************************************/
export const KeywordsHistorySchema = z.record(
  z.object({
    countries: z.record(
      z.object({
        traffic_history: z.array(z.tuple([z.number(), z.number()])),
      })
    ),
  })
);
export type KeywordsHistory = z.infer<typeof KeywordsHistorySchema>;

export const KeywordsHistorySchemaResponse = z.object({
  errors: z.array(z.object({ title: z.string() })),
  terms: KeywordsHistorySchema,
});

export const ResearchKeywordSchema = z.object({
  keyword: z.object({
    term: z.string(),
    phone_apps: z.object({
      app_list: z.array(
        z.object({
          app_id: z.number(),
          term: z.string(),
          rank: z.number(),
        })
      ),
    }),
  }),
});

export const AppKeywordsSchema = z.object({
  keywords: z.array(
    z.object({
      term: z.string(),
      traffic: z.number().nullable(),
      phone_apps: z.object({
        difficulty: z.number().nullable(),
        rank: z.number().nullable(),
      }),
    })
  ),
});
export type AppKeywords = z.infer<typeof AppKeywordsSchema>;

export const SalesReportIosEstimateSchema = z.array(
  z
    .object({
      aid: z.number(),
      cc: z.string(),
      d: z.coerce.date(),
      iu: z.number().optional(),
      ir: z.number().optional(),
      au: z.number().optional(),
      ar: z.number().optional(),
    })
    .optional()
);
export type SalesReportIosEstimate = z.infer<
  typeof SalesReportIosEstimateSchema
>;

export const AppInfoSchema = z.object({
  app_id: z.number(),
  canonical_country: z.string().nullable(),
  name: z.string(),
  publisher_name: z.string().nullable(),
  publisher_id: z.number().nullable(),
  humanized_name: z.string().nullable(),
  icon_url: z.string(),
  os: z.string(),
  active: z.boolean(),
  url: z.string(),
  categories: z.array(z.coerce.string()),
  valid_countries: z.array(z.string()),
  top_countries: z.array(z.string()),
  app_view_url: z.string().nullable(),
  publisher_profile_url: z.string().nullable(),
  release_date: z.string().nullable(),
  updated_date: z.string().nullable(),
  rating: z.number().nullable(),
  price: z.number().nullable(),
  global_rating_count: z.number().nullable(),
  rating_count: z.number().nullable(),
  rating_count_for_current_version: z.number(),
  rating_for_current_version: z.number(),
  version: z.string().nullable(),
  apple_watch_enabled: z.nullable(z.boolean()),
  imessage_enabled: z.nullable(z.boolean()),
  imessage_icon: z.nullable(z.string()),
  humanized_worldwide_last_month_downloads: z.object({
    downloads: z.number(),
    downloads_rounded: z.number(),
    prefix: z.nullable(z.string()),
    string: z.string(),
    units: z.string(),
  }),
  humanized_worldwide_last_month_revenue: z.object({
    prefix: z.string(),
    revenue: z.number(),
    revenue_rounded: z.number(),
    string: z.string(),
    units: z.string(),
  }),
  bundle_id: z.string().nullable(),
  support_url: z.string().nullable(),
  website_url: z.string().nullable(),
  privacy_policy_url: z.string().nullable(),
  eula_url: z.nullable(z.string()),
  publisher_email: z.nullable(z.string().email()),
  publisher_address: z.nullable(z.string()),
  publisher_country: z.string().nullable(),
  feature_graphic: z.string().nullable(),
  short_description: z.nullable(z.string()),
  advisories: z.array(z.string()),
  content_rating: z.string().nullable(),
  unified_app_id: z.string().nullable(),
  screenshot_urls: z.array(z.string()),
  tablet_screenshot_urls: z.array(z.string()),
  description: z.string().nullable(),
  subtitle: z.string().nullable(),
  promo_text: z.string().nullable(),
  permissions: z.nullable(z.array(z.string())),
  supported_languages: z.array(z.string()),
  country_release_date: z.string().nullable(),
});

export const AppsInfoSchema = z.object({
  apps: z.array(AppInfoSchema),
});

export type AppInfo = z.infer<typeof AppInfoSchema>;
export type AppsInfo = z.infer<typeof AppsInfoSchema>;

export const TagSchema = z.object({
  name: z.string(),
  value: z.string(),
  exact_value: z.string(),
});

export type Tag = z.infer<typeof TagSchema>;

export const AppTagsSchema = z.object({
  app_id: z.number(),
  tags: z.array(TagSchema),
});

export type AppTags = z.infer<typeof AppTagsSchema>;

export const CategoryTagDataSchema = z.array(AppTagsSchema);

export const CategoryTagSchema = z.object({
  data: CategoryTagDataSchema,
});

export type CategoryTag = z.infer<typeof CategoryTagSchema>;

export type CategoryTagData = z.infer<typeof CategoryTagDataSchema>;

const PriceSchema = z.object({
  currency: z.string(),
  value: z.number(),
  string_value: z.string(),
  subunit_to_unit: z.number(),
});

const ScreenshotSchema = z.record(z.string(), z.array(z.string()));

const AdvertisedSchema = z.object({
  value: z.string().optional(),
  name: z.string(),
  custom_fields_filter_id: z.string().optional(),
});

export const AppMetadataSchema = z.object({
  screenshots: ScreenshotSchema,
  advertised_on_any_network: AdvertisedSchema,
  app_id: z.number(),
  country: z.string(),
  icon_url: z.string(),
  name: z.string(),
  os: z.string(),
  price: PriceSchema,
  publisher_id: z.number(),
  publisher_name: z.string(),
  publisher_profile_url: z.string(),
  rating: z.number().optional(),
  rating_breakdown: z.array(z.number()).optional(),
  rating_count: z.number().optional(),
  country_release_date: z.coerce.date().optional(),
  current_version: z.string().optional(),
  file_size: z.number().optional(),
  first_released_in: z.array(z.string()).optional(),
  recent_release_date: z.coerce.date().optional(),
  release_date: z.coerce.date().optional(),
  release_status: z.string().optional(),
  supported_languages: z.array(z.string()).optional(),
});

export type AppMetadata = z.infer<typeof AppMetadataSchema>;
