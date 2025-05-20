import Airtable from "airtable";

import { chunk } from "../utils";

type AirtableOptions = {
  tableKey: string;
  tableName: string;
};

export class KAirtable {
  private airtable: Airtable;

  constructor(airtableKey: string) {
    this.airtable = new Airtable({ apiKey: airtableKey });
  }

  public async createRows<T>(
    options: AirtableOptions,
    rows: T[],
    typecast = false
  ) {
    if (rows.length === 0) {
      return Promise.resolve([]);
    }
    const base = this.airtable.base(options.tableKey);
    const dataForAirtable: { fields: Airtable.FieldSet }[] = [];
    rows.forEach((row) =>
      dataForAirtable.push({ fields: row as Airtable.FieldSet })
    );
    const chunkedArray = chunk(dataForAirtable, 10);
    const rowsCreated = [];
    for (const chunk of chunkedArray) {
      try {
        const newRows = await base(options.tableName).create(chunk, {
          typecast,
        });
        rowsCreated.push(...newRows);
      } catch (err) {
        const message = "Airtable error " + (err as Error).message;
        throw message;
      }
    }
    return rowsCreated;
  }

  public async getRows(
    options: AirtableOptions,
    filterByFormula = "",
    sort: { field: string; direction: "asc" | "desc" }[] = [],
    fieldsToGet: string[] = [],
    maxRecords?: number
  ) {
    const base = this.airtable.base(options.tableKey);
    const configs: {
      filterByFormula: string;
      sort: { field: string; direction: "asc" | "desc" }[];
      fields: string[];
      maxRecords?: number;
    } = {
      filterByFormula: filterByFormula,
      sort: sort,
      fields: fieldsToGet,
    };

    if (maxRecords) {
      configs.maxRecords = maxRecords;
    }

    try {
      const data = await base(options.tableName).select(configs).all();
      const idAndFieldsByRows = data.map((row) => {
        const idAndFields = { id: row.id, fields: row.fields };
        return idAndFields;
      });
      return idAndFieldsByRows;
    } catch (err) {
      const message = "Airtable error " + (err as Error).message;
      console.log(`[Airtable getRows] Error: ${message}`);
      return [];
    }
  }

  public async updateRows(
    options: AirtableOptions,
    rowsToUpdate: { id: string; fields: Airtable.FieldSet }[]
  ) {
    if (rowsToUpdate.length === 0) {
      return;
    }
    const base = this.airtable.base(options.tableKey);
    const chunkedArray = chunk(rowsToUpdate, 10);
    for (const chunk of chunkedArray) {
      try {
        await base(options.tableName).update(chunk);
      } catch (err) {
        const message = "Airtable error " + (err as Error).message;
        throw message;
      }
    }
  }

  public deleteRows(options: AirtableOptions, rowIdToDelete: string) {
    const base = this.airtable.base(options.tableKey);
    return base(options.tableName).destroy([rowIdToDelete]);
  }
}
