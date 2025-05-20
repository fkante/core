import { env } from "../../env";

export class ApiGatewayClient {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor() {
    this.baseUrl = env.API_GATEWAY_URL;
    this.token = env.API_GATEWAY_TOKEN;
  }

  private validateAndFormatAppCode(appCode: unknown): string {
    if (typeof appCode !== 'string') {
      throw new Error("appCode must be a string.");
    }
    const parts = appCode.split('-');
    if (parts.length !== 2) {
      throw new Error("appCode must be in the format CODE-OS (e.g., BEN-IOS).");
    }
    const [code, os] = parts;
    if (!code || !os) {
      throw new Error("appCode parts (CODE and OS) cannot be empty.");
    }
    // Ensure consistent casing, e.g., ben-ios -> BEN-IOS
    return appCode.toUpperCase();
  }

  private async handleAppCodeValidation({
    method,
    params,
    options,
  }: {
    method: 'GET' | 'POST',
    params?: Record<string, string | undefined>,
    options?: RequestInit,
  }): Promise<void> {

    if (method === 'GET' && params && params.appCode) {
      this.validateAndFormatAppCode(params.appCode);
      return;
    }

    let appCodeToValidate: unknown = null;
    if(method === 'POST' && options && options.body) {
      try {
        if (typeof options.body === 'string') {
          const bodyData = JSON.parse(options.body);
          if (bodyData && bodyData.appCode) {
            appCodeToValidate = bodyData.appCode;
          }
        } else if (options.body instanceof URLSearchParams) {
          appCodeToValidate = options.body.get('appCode');
        }
      } catch (error) {
        console.warn("Could not parse body to find appCode for validation:", error);
      }
    }
    if (appCodeToValidate !== null) {
      this.validateAndFormatAppCode(appCodeToValidate);
    }
  }

  async get({
    path,
    params,
    options = {}
  }: {
    path: string,
    params?: Record<string, string | undefined>,
    options?: RequestInit
  }): Promise<Response> {
    await this.handleAppCodeValidation({
      method: 'GET',
      params,
      options,
    });
    const url = `${this.baseUrl}${path}`;
    const queryParams = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    const response = await fetch(`${url}${queryParams}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.token}`,
      },
    });
    return response;
  }

  async post({
    path,
    options = {}
  }: {
    path: string,
    options?: RequestInit
  }): Promise<Response> {
    await this.handleAppCodeValidation({
      method: 'POST',
      options,
    });
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.token}`,
      },
    });
    return response;
  }
}
