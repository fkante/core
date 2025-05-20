import { OAuth2Client } from "google-auth-library";
import { gmail_v1, google } from "googleapis";

import { Email, EmailSchema, Token, TokenSchema } from "./schemas";

const DEFAULT_URL = "http://localhost:3000";

export class Gmail {
  private gmail: gmail_v1.Gmail;
  private oauth2Client: OAuth2Client;

  constructor(
    clientId: string,
    clientSecret: string,
    token?: Token | undefined
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      DEFAULT_URL
    );
    if (!token) {
      throw new Error("Missing Token!");
    }
    this.gmail = this.initializeAPI(token);
  }

  private initializeAPI(token: Token) {
    this.oauth2Client.setCredentials(token);
    return google.gmail({ version: "v1", auth: this.oauth2Client });
  }

  getGeneratedAuthUrl(scopes: string[]): string {
    const url = this.oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: "offline",
      // If you only need one scope you can pass it as a string
      scope: scopes,
    });
    return url;
  }

  async getTokenFromCode(code: string): Promise<Token> {
    const token: Token = TokenSchema.parse(
      await this.oauth2Client.getToken(code)
    );
    return token;
  }

  async getMails() {
    try {
      if (!this.gmail) {
        throw new Error("gmail variable is undefined");
      }
      const res = await this.gmail.users.messages.list({ userId: "me" });
      const messages = res.data.messages;
      const emails: Email[] = [];

      if (!messages) {
        throw new Error("Message is undefined");
      }
      for (const mail of messages) {
        if (!mail.id) {
          continue;
        }
        const emailObject = await this.gmail.users.messages.get({
          userId: "me",
          id: mail.id,
        });
        const emailData = emailObject.data;
        const headerData = emailData.payload?.headers;
        const email: Email = EmailSchema.parse({
          emailId: mail.id,
          sender: headerData?.find((data) => data.name === "From")?.value,
          subject: headerData?.find((data) => data.name === "Subject")?.value,
          body: emailData.snippet,
          date: new Date(Number(emailData.internalDate)),
        });
        emails.push(email);
      }
      return emails;
    } catch (error: unknown) {
      console.error("Error fetching emails:", (error as Error).message);
      throw new Error("Error fetching emails: " + (error as Error).message);
    }
  }
}
