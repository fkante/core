import { CategoryTagData, SensorTowerKpis, TopAppSchema } from "./schemas";

import { reverseMap } from "../../utils";

export function formatCategoryTags(result: CategoryTagData) {
  const extractedData = result.map((app) => {
    const appData: { [key: string]: string | number } = { app_id: app.app_id };
    app.tags.map((tag: { name: string; exact_value: string }) => {
      const key = reverseMap(SensorTowerKpis)[tag.name];

      if (key) {
        appData[tag.name] = tag.exact_value.replace("$", "").replace("MB", "");
      }
    });
    return TopAppSchema.parse(appData);
  });

  return extractedData;
}
