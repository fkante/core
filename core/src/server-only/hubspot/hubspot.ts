import { BASE_URL, DEALS_LIMIT } from "./constant";
import {
  CompanyBody,
  ContactBody,
  DealBody,
  FecthDealResponseSchema,
  HubspotFetchConfig,
  HubspotObjectResponseSchema,
  ObjectTypeProperties,
  ObjectTypePropertiesSchema,
} from "./schemas";

export enum Endpoint {
  DEALS = "crm/v3/objects/deals",
  CONTACTS = "crm/v3/objects/contacts",
  COMPANIES = "crm/v3/objects/companies",
  PROPERTIES = "crm/v3/properties",
}

export enum HubspotObjectTypes {
  DEALS = "deals",
  CONTACTS = "contacts",
  COMPANIES = "companies",
  PROPERTIES = "properties",
}

type LowercaseEnumKeys<T extends Record<string, string>> = Lowercase<
  Extract<keyof T, string>
>;

export type HubspotObjectType = LowercaseEnumKeys<typeof HubspotObjectTypes>;

export class KHubspot {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch(config: HubspotFetchConfig) {
    const { method, parameters, endpoint, body, headers } = config;
    const isPost = method === "POST";
    const query = new URLSearchParams(parameters).toString();
    const url = `${BASE_URL}/${endpoint}?${query}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...headers,
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: isPost ? JSON.stringify(body) : undefined,
      });

      return response;
    } catch (err) {
      console.log(`Error fetching data from hubspot ${endpoint}`, err);
      throw err;
    }
  }

  async getDeals(after: string | null, maxLimit: number = DEALS_LIMIT) {
    let parameters: Record<string, string> = {
      limit: String(maxLimit),
    };

    if (after) {
      parameters = {
        ...parameters,
        after,
      };
    }

    const response = await this.fetch({
      method: "GET",
      parameters: parameters,
      endpoint: Endpoint.DEALS,
    });

    const deals = await response.json();
    return FecthDealResponseSchema.parse(deals);
  }

  async createDeal(dealBody: DealBody) {
    const response = await this.fetch({
      method: "POST",
      endpoint: Endpoint.DEALS,
      body: dealBody,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const body = await response.json();
    const deal = HubspotObjectResponseSchema.parse(body);
    return deal;
  }

  async createContact(contactBody: ContactBody) {
    const response = await this.fetch({
      method: "POST",
      endpoint: Endpoint.CONTACTS,
      body: contactBody,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    const contact = HubspotObjectResponseSchema.parse(result);
    return contact;
  }

  async createCompany(companyBody: CompanyBody) {
    const response = await this.fetch({
      method: "POST",
      endpoint: Endpoint.COMPANIES,
      body: companyBody,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const company = HubspotObjectResponseSchema.parse(await response.json());
    return company;
  }

  async getProperties(
    objectType: HubspotObjectType
  ): Promise<ObjectTypeProperties> {
    const response = await this.fetch({
      method: "GET",
      endpoint: `${Endpoint.PROPERTIES}/${objectType}?archived=false`,
    });

    const body = await response.json();
    const properties = ObjectTypePropertiesSchema.parse(body);
    return properties;
  }
}
