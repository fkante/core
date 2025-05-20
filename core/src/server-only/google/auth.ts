import { google } from "googleapis";

import { AccessTokenSchema, GoogleSecret, GoogleToken } from "./schemas";

const GOOGLE_OAUTH_BASE_URL = "https://www.googleapis.com/oauth2/v3/token";

export class Auth {
  private secrets: {
    credentials: GoogleSecret;
    token: GoogleToken;
  };

  constructor(secrets: { credentials: GoogleSecret; token: GoogleToken }) {
    this.secrets = secrets;
  }

  async getClient() {
    const { credentials, token } = this.secrets;
    const clientSecret = credentials.web.client_secret;
    const clientId = credentials.web.client_id;
    const redirectUrl = credentials.web.redirect_uris[0];

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUrl
    );

    oauth2Client.setCredentials(token);

    return oauth2Client;
  }

  async getAccessToken() {
    const { client_id, client_secret } = this.secrets.credentials.web;
    const { refresh_token } = this.secrets.token;
    const response = await fetch(GOOGLE_OAUTH_BASE_URL, {
      method: "POST",
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id,
        client_secret,
        refresh_token,
      }),
    });
    const json = AccessTokenSchema.parse(await response.json());
    return json.access_token;
  }
}
