import { type App } from './apps.types';
import { type App as KovaleeApp } from "@kovalee/core"

const DEFAULT_SQUAD = "red"
type KovaleeAppWithoutCode = Omit<KovaleeApp, 'code'>

export class AppsMapper {

  public static toInternalApp(externalApp: KovaleeAppWithoutCode): App {
    return {
      code: externalApp.appCode,
      icon: externalApp.appIcon || null,
      banner: externalApp.appBanner || null,
      name: externalApp.appName,
      os: externalApp.appOs,
      squad: externalApp.squad || DEFAULT_SQUAD,
      storeUrl: externalApp.storeUrl || "",
      vertical: externalApp.vertical,
      description: externalApp.appDescription || "",
    };
  }

  public static toInternalAppList(
    externalApps: KovaleeAppWithoutCode[]
  ): App[] {
    if (externalApps.length === 0) {
      console.warn('No apps found in API response or response structure is invalid:', externalApps);
      return [];
    }
    return externalApps.map(app => AppsMapper.toInternalApp(app))
  }
}
