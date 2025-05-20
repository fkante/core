import { getAppAdjustToken } from "..";
import { formatDate, getGMTDate, isIOS } from "../../utils";
import {
  AdjustChangeStatus,
  AdjustChangeStatusEnum,
  AdjustHistoryChange,
  AdjustHistoryChangesSchema,
} from "./schemas";

const CONTROL_CENTER_BASE_URL = "https://dash.adjust.com/control-center";
const REPORT_SERVICE_ENDPOINT = "reports-service";

const SUCCESSFUL_CHANGE_STATUSES = ["success", "approved"];
const PENDING_CHANGE_STATUSES = ["pending", "queued"];

export class Adjust {
  private adjustUserToken: string;

  constructor(adjustUserToken: string) {
    this.adjustUserToken = adjustUserToken;
  }

  private fetchApi(endpoint: string) {
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.adjustUserToken}`,
      },
    };

    return fetch(`${CONTROL_CENTER_BASE_URL}/${endpoint}`, options);
  }

  public async getAdjustCosts({
    appCode,
    startDate,
    endDate,
    dimensions,
    costMode = "network",
  }: {
    appCode: string;
    startDate: Date;
    endDate: Date;
    dimensions: string;
    costMode?: "network" | "partner";
  }) {
    const isIos = isIOS(appCode);
    const startDateFormatted = formatDate(startDate);
    const endDateFormatted = formatDate(
      getGMTDate(endDate.getTime().toString(), true)
    );
    const appToken = await getAppAdjustToken(appCode);
    if (!appToken) {
      return {};
    }
    // We need to get installs to get data about campaigns that have no cost (link deep link campaigns)
    // otherwise they won't be in the response
    const kpis = "cost,installs";

    try {
      const adjustCostUrl = `${REPORT_SERVICE_ENDPOINT}/report?app_token__in=${appToken}&ad_spend_mode=${costMode}&metrics=${kpis}&dimensions=${dimensions}&date_period=${startDateFormatted}:${endDateFormatted}${
        isIos ? "&os_names=ios" : "&os_names=android"
      }&network__exclude=organic`;

      const response = await this.fetchApi(adjustCostUrl);
      const json = await response.json();
      return json;
    } catch (error) {
      console.log(error);
    }
    return {};
  }

  public async getHistoryChanges(
    startDate: Date,
    endDate: Date
  ): Promise<AdjustHistoryChange[]> {
    const queryParams = new URLSearchParams({
      created_at__gte: formatDate(startDate),
      created_at__lte: formatDate(endDate),
    });

    const response = await this.fetchApi(
      `operations-service/history?${queryParams.toString()}`
    );

    const json = await response.json();
    return AdjustHistoryChangesSchema.parse(json?.rows);
  }

  public getChangeStatus(status: string): AdjustChangeStatus {
    if (SUCCESSFUL_CHANGE_STATUSES.includes(status)) {
      return AdjustChangeStatusEnum.Enum.success;
    }

    if (PENDING_CHANGE_STATUSES.includes(status)) {
      return AdjustChangeStatusEnum.Enum.pending;
    }

    return AdjustChangeStatusEnum.Enum.failed;
  }
}
