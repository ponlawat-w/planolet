import { parse as parseCsv } from 'csv/browser/esm/sync';
import type { TableSource } from '@skeletonlabs/skeleton';
import type { CSVGeneralOptions } from './csv/options';

export type TableColumnType = 'raw';

export type TableColumn = {
  name: string,
  type: TableColumnType
};

export type TableRow = any[];

export class DataTable {
  protected _headers: TableColumn[];
  protected _rows: TableRow[];

  public get headers(): TableColumn[] { return this._headers; }
  public get rows(): TableRow[] { return this._rows; }

  public constructor(headers: TableColumn[], rows: TableRow[]) {
    this._headers = headers;
    this._rows = rows;
  }

  public toTableSource(): TableSource {
    return {
      head: this._headers.map(x => x.name),
      body: this._rows
    };
  }

  public objectifyRow<T = any>(row: TableRow): T {
    const obj = {};
    for (let i = 0; i < this._headers.length; i++) {
      obj[this._headers[i].name] = row[i];
    }
    return obj as T;
  }

  private static getHeaders(records: Record<string, any>[]): TableColumn[] {
    const headers = new Set<string>();
    for (const record of records) {
      for (const key of Object.keys(record)) {
        headers.add(key);
      }
    }
    return [...headers].map(x => ({ name: x, type: 'raw' }));
  }

  public static createFromRecords(records: Record<string, any>[]): DataTable {
    const headers = DataTable.getHeaders(records);
    const rows = [];
    for (const record of records) {
      rows.push(headers.map(x => record[x.name] ? record[x.name] : undefined));
    }
    return new DataTable(headers, rows);
  }

  public static createFromCsv(csvContent: string, options: CSVGeneralOptions): DataTable {
    let first: boolean = true;
    let headers: TableColumn[] = [];
    let rows: TableRow[] = [];
    for (let row of parseCsv(csvContent, { columns: false, delimiter: options.delimiter }) as any[][]) {
      if (first) {
        headers = row.map((x: string) => ({ name: x, type: 'raw' }));
        first = false;
        continue;
      }
      rows.push(row);
    }
    return new DataTable(headers, rows);
  }

  public static validateCsvContent(csvContent: string, options: CSVGeneralOptions, minColumns: number = 1): boolean {
    try {
      if (!csvContent) return false;
      let first: boolean = true;
      let columnsCount: number = undefined;
      for (let row of parseCsv(csvContent, { columns: false, delimiter: options.delimiter }) as any[][]) {
        if (first) {
          columnsCount = row.length;
          first = false;
          continue;
        }
        if (row.length !== columnsCount) {
          return false;
        }
      }
      return !first && columnsCount >= minColumns;
    } catch { return false; }
  }
};
