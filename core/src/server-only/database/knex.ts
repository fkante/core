import knex, { Knex } from "knex";

import pg from "pg";

export interface QueryMap {
  [key: string]: (b: Knex.QueryBuilder) => Knex.QueryBuilder;
}

export interface PaginatedQuery {
  limit: number;
  offset: number;
}

type RawPaginatedResults<T> = T & { itemcount?: string };

pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);

export interface PaginatedResult<T> {
  items: T[];
  itemCount: number;
}

export class Repository<T> {
  protected pg!: Knex;

  constructor() {
    this.pg = Repository.pg;
  }

  static pg: Knex;

  static async initializeKnex(
    user: string,
    host: string,
    databaseName: string,
    password: string,
    port: number,
    serviceName: string,
    ssl: boolean,
    schema: string[]
  ) {
    if (Repository.pg) {
      return Repository.pg;
    }

    Repository.pg = knex({
      client: "pg",
      connection: {
        host,
        port,
        user,
        password,
        ssl,
        database: databaseName,
        application_name: serviceName,
      },
      pool: {
        min: 2,
        max: 10,
      },
      searchPath: schema,
    });

    Repository.pg.on("error", (err) => console.log("error", { err }));

    //test connection
    await this.pg.raw("select 1+1 as result");

    return Repository.pg;
  }
  /**
   * Creates a knex query object for a specified table
   * @param table table name
   * @param excluded fields which should be excluded from the query result to be returned
   * @returns
   */
  protected setup(table: string, ...excluded: string[]) {
    return () => this.pg(table).queryContext({ excluded });
  }

  /**
   * Creates a knex query object for a specified table
   * @param table table name
   * @param schema schema the table belongs to
   * @param excluded fields which should be excluded from the query result to be returned
   * @returns
   */
  protected setupWithSchema(
    table: string,
    schema: string,
    ...excluded: string[]
  ) {
    return () => this.pg(table).queryContext({ excluded }).withSchema(schema);
  }

  /**
   * Map query triggers to their corresponding queries
   * @param db query builder from knex
   * @param query actual query
   * @param map mapping of triggers to query functions
   * @returns query builder for further queries
   */
  protected query(
    db: Knex.QueryBuilder,
    query: Record<string, unknown>,
    map: QueryMap
  ) {
    let currentQuery = db;

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && key in map) {
        currentQuery = map[key](currentQuery);
      }
    });

    return currentQuery;
  }

  protected async paginated(
    db: Knex.QueryBuilder,
    limit: number,
    offset: number
  ): Promise<PaginatedResult<T>> {
    const raw: RawPaginatedResults<T>[] = await db
      .select(this.pg.raw("count(*) OVER() AS itemcount"))
      .limit(limit)
      .offset(offset);

    if (raw.length === 0) {
      return { itemCount: 0, items: [] };
    }

    const total = raw[0].itemcount ? parseInt(raw[0].itemcount) : 0;

    const items: RawPaginatedResults<T>[] = raw.map((result) => {
      const { itemcount, ...rest } = result;
      return rest as RawPaginatedResults<T>;
    });

    return { itemCount: total, items };
  }

  static async close() {
    if (Repository.pg) {
      await Repository.pg.destroy();
    }
  }
}

// Code snippet

// import { Repository, PaginatedResult } from '@kovalee/core/server';

// 	interface User {
// 	  id: number;
// 	  name: string;
// 	  email: string;
// 	}
// 	export class UserRepository extends Repository<User> {

// 	 private db = this.setup("users");

// 	 async createUser(name: string, email: string): Promise<User> {
// 		 const [createdUser] = await this.db().insert({ name, email }, '*');
// 		 return createdUser;
// 	 }

// 	 async getUserById(id: number): Promise<User | undefined> {
// 		 return this.pg('users').where({ id }).first();
// 	 }

// 	 async updateUser(id: number, dto: Partial<User>): Promise<User | undefined> {
// 		 const [updatedUser] = await this.pg('users').where({ id }).update(dto, '*');
// 		 return updatedUser;
// 	 }

// 	 async deleteUser(id: number): Promise<boolean> {
// 		 const deletedCount = await this.pg('users').where({ id }).del();
// 		 return deletedCount > 0;
// 	 }
//    }

//Add this to the source index folder ensuring only one instance is used

// import { Repository } from '@kovalee/core/server';
// Repository.initializeKnex(
// ENV.DB_USER, ENV.DB_HOST, ENV.DB_PASSWORD, ENV.DB_PORT, "ams", ENV.DB_SSL, ["kovaleeapps,slackapps, krome"]
// )
