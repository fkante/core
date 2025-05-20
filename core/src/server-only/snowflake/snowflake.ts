import crypto from "crypto";

import snowflake from "snowflake-sdk";

const SNOWFLAKE_ACCOUNT = "pp48035.eu-west-3.aws";
const WAREHOUSE = "TOOLS_WH";
const DATABASE = "GOLD";
const SCHEMA = "DBT_PROD";
const USERNAME = "API_USER";

export class KSnowflake {
  private connection: snowflake.Connection;
  private debugLog: boolean;

  constructor(snowflakeKey: string, debugLog = false) {
    snowflake.configure({
      logLevel: debugLog ? "DEBUG" : "ERROR",
      logFilePath: "/tmp/snowflake.log",
    });
    this.connection = this.getConnection(snowflakeKey);
    this.debugLog = debugLog;
  }

  private getConnection(snowflakeKey: string) {
    const privateKeyObject = crypto.createPrivateKey({
      key: snowflakeKey,
      format: "pem",
    });
    const privateKey = privateKeyObject.export({
      type: "pkcs8",
      format: "pem",
    });

    const connection = snowflake.createConnection({
      account: SNOWFLAKE_ACCOUNT,
      username: USERNAME,
      authenticator: "SNOWFLAKE_JWT",
      privateKey: privateKey.toString(),
      warehouse: WAREHOUSE,
      database: DATABASE,
      schema: SCHEMA,
    });
    return connection;
  }

  private async connect() {
    if (this.connection.isUp()) {
      return;
    }
    await this.connection.connectAsync((err, connection) => {
      if (connection.isUp()) {
        this.log("Connection is up ✅");
      }
      if (err) {
        console.log(err);
        this.log("Unable to connect: " + err.message);
      }
    });
  }

  terminateConnection() {
    if (!this.connection.isUp()) {
      this.log("Connection is down ❌");
      return;
    }
    this.connection.destroy((err) => {
      if (err) {
        this.log("Unable to disconnect: " + err.message);
      }
    });
  }

  async executeQuery<T>(
    query: string,
    binds?: snowflake.Bind[]
  ): Promise<T[] | undefined> {
    await this.connect();
    this.log("Executing query: " + query);

    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: query,
        binds,
        complete: (err, stmt, rows) => {
          if (err) {
            this.log("Query error ❌");
            console.error(err.message);
            reject(err);
          }
          this.log("Query done successfully ✅");
          resolve(rows);
        },
      });
    });
  }

  log(message: string) {
    if (this.debugLog) {
      console.log("[Snowflake ❄️ ]", message);
    }
  }
}
