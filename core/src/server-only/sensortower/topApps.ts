import { z } from "zod";

import { SensorTowerKpis, TopApps, TopAppSchema } from "./schemas";

export function formatTopApps(apps: TopApps) {
  const topApps = apps.map((app) => {
    const customTags = app.custom_tags;
    const newCustomTags = Object.fromEntries(
      Object.entries(customTags)
        .filter(([key]) =>
          (Object.values(SensorTowerKpis) as string[]).includes(key)
        )
        .map(([key, value]) => {
          // Remove $, MB, and , from the value
          return [key, value.replace(/[$,MB]/g, "")];
        })
    );
    return {
      app_id: app.app_id,
      [SensorTowerKpis.ABSOLUTE_DOWNLOADS]: app.units_absolute,
      [SensorTowerKpis.CHANGE_DOWNLOADS]: app.units_delta,
      [SensorTowerKpis.CHANGE_RATIO_DOWNLOADS]: app.units_transformed_delta,
      [SensorTowerKpis.ABSOLUTE_REVENUE]: app.revenue_absolute,
      [SensorTowerKpis.CHANGE_REVENUE]: app.revenue_delta,
      [SensorTowerKpis.CHANGE_RATIO_REVENUE]: app.revenue_transformed_delta,
      ...newCustomTags,
    };
  });
  return z.array(TopAppSchema).parse(topApps);
}
