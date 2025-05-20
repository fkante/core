import { AppSchemaWithoutCode, type AppsResponse } from './apps.types';

import { ApiGatewayClient } from '../common/api-gateway-client';
import { AppsMapper } from './apps.mapper';
import { z } from 'zod';

const APPS_ENDPOINT = "/aws/apps"
const AMS_ENDPOINT = "/ams"


export class AppsClient {
  constructor(private http = new ApiGatewayClient()) {}

  async fetchSignedApps() {
    try {
      const response = await this.http.get({
        path: APPS_ENDPOINT,
        params: {
          signed: "true"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch apps. Status: ${response.status}`);
      }
      const { apps } = await response.json() as AppsResponse;
      if (!apps) {
        throw new Error("No apps found");
      }
      return AppsMapper.toInternalAppList(z.array(AppSchemaWithoutCode).parse(apps));


    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching all apps: ${error.message}`, error);
      }
      throw new Error('Failed to fetch all apps from the external API.');
    }
  }

  async fetchAppByCode(appCode: string) {
    try {
      const response = await this.http.get({
        path: `${AMS_ENDPOINT}/get-app-by-code`,
        params: {
          code: appCode
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch app. Status: ${response.status}`);
    }
    const { app } = await response.json() as { app: unknown }

    return AppsMapper.toInternalApp(AppSchemaWithoutCode.parse(app))

    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching app by code: ${error.message}`, error);
      }
      throw new Error('Failed to fetch app by code from the external API.');
    }
  }
}

export const appsClient = new AppsClient();
