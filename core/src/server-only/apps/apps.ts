import { App } from "../..";
import { AppSchema, AppsSchema } from "../../apps/schemas";

const BASE_URL = process.env.SERVER_BASE_URL || "http://localhost:4000";

function businessLogicTransformation<T extends Record<string, string>>(
  app: T
): App {
  const code = app.app_code;
  const appOs = app.app_os;
  const appCode = code.toUpperCase() + "-" + appOs.toUpperCase();
  return AppSchema.parse({
    ...app,
    displayName: app.app_name,
    code: appCode,
    appName: appCode,
    revenueCatBucketName: app.revenuecat_bucket_name,
    revenueCatFolderName: app.revenuecat_folder_name,
  });
}

function getTransformedApps<T extends Record<string, string>>(
  apps: T[]
): App[] {
  const transformedApps: App[] = [];
  for (const app of apps) {
    transformedApps.push(businessLogicTransformation(app));
  }
  return AppsSchema.parse(
    transformedApps.sort((a, b) => {
      return a.appName.localeCompare(b.appName);
    })
  );
}

export async function getApp(
  queryType: "code" | "token" | "bundleId" | "appleAppId",
  query: string
) {
  const response = await fetch(
    `${BASE_URL}/ams/get-app-by?${queryType}=${query}`
  );
  const rawData = await response.json();
  const { app: appData } = rawData;
  return businessLogicTransformation(appData);
}

export async function getAppByCode(code: string) {
  const response = await fetch(`${BASE_URL}/ams/get-app-by-code?code=${code}`);
  const rawData = await response.json();
  const { app } = rawData;
  return businessLogicTransformation(app);
}

export async function getAppleIdFromAppCode(code: string) {
  const app = await getApp("code", code);
  return app.appleAppId;
}

export async function getBundleIdFromAppCode(code: string) {
  const app = await getApp("code", code);
  return app.bundleId;
}

export async function getAppAdjustToken(code: string) {
  const app = await getApp("code", code);
  return app.adjustToken;
}

export async function getSignedApps() {
  const response = await fetch(
    `${BASE_URL}/ams/get-data?signed=true&deleted=false&studio=false`
  );
  const rawData = await response.json();
  return getTransformedApps(rawData);
}

export async function getUnsignedApps() {
  const response = await fetch(
    `${BASE_URL}/ams/get-data?signed=false&deleted=false`
  );
  const rawData = await response.json();
  return getTransformedApps(rawData);
}

export async function getStudioApps() {
  const response = await fetch(
    `${BASE_URL}/ams/get-data?studio=true&deleted=false`
  );
  const rawData = await response.json();
  return getTransformedApps(rawData);
}

export async function getApps() {
  const response = await fetch(`${BASE_URL}/ams/get-data?deleted=false`);
  const rawData = await response.json();
  return getTransformedApps(rawData);
}

export async function getAppsWithQuery(
  deleted?: boolean,
  signed?: boolean,
  studio?: boolean
) {
  const queries: string[] = [];
  if (typeof deleted != "undefined") {
    queries.push(`deleted=${deleted}`);
  }
  if (typeof signed != "undefined") {
    queries.push(`signed=${signed}`);
  }
  if (typeof studio != "undefined") {
    queries.push(`studio=${studio}`);
  }
  const query = `${BASE_URL}/ams/get-data?` + queries.join("&");
  const response = await fetch(query);
  const rawData = await response.json();
  return getTransformedApps(rawData);
}
