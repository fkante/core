import pg from "pg";

// TODO: We should close the connection
export class KDB {
  private client: pg.Client;

  constructor(
    user: string,
    host: string,
    databaseName: string,
    password: string,
    port: number,
    ssl: boolean = false
  ) {
    this.client = new pg.Client({
      user,
      host,
      database: databaseName,
      password,
      port,
      ssl,
    });

    this.connect();
  }

  public async end() {
    try {
      await this.client.end();
    } catch (error) {
      console.error("Error closing the database connection:", error);
      throw error;
    }
  }

  private async connect() {
    try {
      await this.client.connect();
      return Promise.resolve();
    } catch (error) {
      console.error(
        `Error connecting to the database ${this.client.database}:`,
        error
      );
      throw error;
    }
  }

  public async query(
    query: string,
    values?: (string | number | boolean | null | undefined | Date)[]
  ) {
    try {
      const results = await this.client.query(query, values);
      return results.rows;
    } catch (error) {
      console.error("Error querying the database:", error);
      throw error;
    }
  }

  public async queryViaTransaction(
    query: string,
    values?: (string | number | boolean | null | undefined | Date)[]
  ) {
    const client = this.client;
    try {
      await client.query("BEGIN");
      const results = await client.query(query, values);
      await client.query("COMMIT");
      return results.rows;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error querying the database:", error);
      throw error;
    }
  }
}
