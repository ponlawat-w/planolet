import { parse as parseCsv } from 'csv/browser/esm/sync';
import { v4 } from 'uuid';
import type { CSVGeneralOptions } from '../csv/options';

export type TableColumnType = 'raw';

export type TableColumn = {
  name: string,
  type: TableColumnType,
  hidden?: boolean
};

export type TableRow = any[];

export type TableDataSourceRow = { id: string|undefined, data: TableRow };
export type TableDataSource = {
  columns: string[],
  rows: TableDataSourceRow[]
};

const filterRowVisibleColumns = (row: TableRow, columnIndicies: number[]): TableRow => columnIndicies.map(i => row[i]);

export class DataTable {
  protected _columns: TableColumn[];
  protected _rows: TableRow[];
  protected _idField: string|undefined = undefined;

  public get columns(): TableColumn[] { return this._columns; }
  public get rows(): TableRow[] { return this._rows; }

  public constructor(headers: TableColumn[], rows: TableRow[], idField?: string) {
    this._columns = headers;
    this._rows = rows;
    if (idField) this.setIdField(idField);
  }

  public addRowIds(fieldName = '__ROW_ID__') {
    this._columns.push({ name: fieldName, type: 'raw' });
    for (const row of this._rows) {
      row.push(v4());
    }
    this._idField = fieldName;
  }

  public getIdFieldIndex(): number {
    return this._idField ? this._columns.map(x => x.name).indexOf(this._idField) : -1;
  }

  public setIdField(fieldName: string) {
    this._idField = fieldName;
    const idx = this.getIdFieldIndex();
    if (idx < 0) throw new Error('ID field does not exist');
    this._columns[idx].hidden = true;
  }

  public toTableDataSource(): TableDataSource {
    const idFieldIndex = this.getIdFieldIndex();
    const visibleColumns: { col: TableColumn, idx: number }[]
      = this._columns.map((col, idx) =>  col.hidden ? undefined : ({ col, idx })).filter(x => x);
    const visibleColumnIndices: number[] = visibleColumns.map(x => x.idx);

    const columns = visibleColumns.map(x => x.col.name);
    const rows = this._rows.map(row => ({
      id: idFieldIndex > -1 ? row[idFieldIndex] : undefined,
      data: filterRowVisibleColumns(row, visibleColumnIndices)
    }));

    return { columns, rows };
  }

  public objectifyRow<T = any>(row: TableRow): T {
    const obj = {};
    for (let i = 0; i < this._columns.length; i++) {
      obj[this._columns[i].name] = row[i];
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
