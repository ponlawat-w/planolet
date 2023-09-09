import { parse as parseCsv } from 'csv/browser/esm/sync';
import type { TableSource } from '@skeletonlabs/skeleton';
import type { CSVGeneralOptions } from './csv/options';
import { v4 } from 'uuid';

export type TableColumnType = 'raw';

export type TableColumn = {
  name: string,
  type: TableColumnType
};

export type TableRow = any[];

export class DataTable {
  protected _headers: TableColumn[];
  protected _rows: TableRow[];
  protected _idField: string|undefined = undefined;

  public get headers(): TableColumn[] { return this._headers; }
  public get rows(): TableRow[] { return this._rows; }

  public constructor(headers: TableColumn[], rows: TableRow[], idField?: string) {
    this._headers = headers;
    this._rows = rows;
    this._idField = idField;
  }

  public addRowIds(fieldName = '__ROW_ID__') {
    this._headers.push({ name: fieldName, type: 'raw' });
    for (const row of this._rows) {
      row.push(v4());
    }
    this._idField = fieldName;
  }

  public setIdField(fieldName: string) {
    this._idField = fieldName;
  }

  public toTableSource(): TableSource {
    const idFieldIndex = this._idField ? this._headers.map(x => x.name).indexOf(this._idField) : -1;
    return {
      head: this._headers.filter((_, i) => idFieldIndex ? idFieldIndex !== i : true).map(x => x.name),
      body: this._rows.map(row => row.filter((_, i) => idFieldIndex > -1 ? idFieldIndex !== i : true)),
      meta: idFieldIndex > -1 ? this._rows.map(x => [x[idFieldIndex]]) : undefined
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

  public static createFromRecords(records: Record<string, any>[], idField?: string): DataTable {
    const headers = DataTable.getHeaders(records);
    const rows = [];
    for (const record of records) {
      rows.push(headers.map(x => record[x.name] ? record[x.name] : undefined));
    }
    return new DataTable(headers, rows, idField);
  }

  public static createFromCsv(csvContent: string, options: CSVGeneralOptions, idField?: string): DataTable {
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
    return new DataTable(headers, rows, idField);
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
