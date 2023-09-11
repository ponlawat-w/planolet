import { v4 } from 'uuid';
import type { TableColumn, TableDataSource, TableDataSourceRow, TableRow } from './types';
import { tableFormatValue } from './utils';

export class DataTable {
  protected _columns: TableColumn[];
  protected _rows: TableRow[];
  protected _idField: string|undefined = undefined;

  public get columns(): TableColumn[] { return this._columns; }
  public get rows(): TableRow[] { return this._rows; }
  public get idField(): string|undefined { return this._idField; }

  public constructor(headers: TableColumn[], rows: TableRow[], idField?: string) {
    this._columns = headers;
    this._rows = rows;
    if (idField) this.setIdField(idField);
  }

  public addRowIds(fieldName = '__ROW_ID__') {
    this._columns.push({ name: fieldName, type: 'uuid', nullable: false, hidden: true });
    for (const row of this._rows) {
      row.push(v4());
    }
    this._idField = fieldName;
  }

  public getColumnIndex(column: string): number {
    return this._columns.map(x => x.name).indexOf(column);
  }

  public getIdFieldIndex(): number {
    return this._idField ? this.getColumnIndex(this._idField) : -1;
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

    const columns: TableColumn[] = visibleColumns.map(x => x.col);
    const rows: TableDataSourceRow[] = this._rows.map(row => ({
      id: idFieldIndex > -1 ? row[idFieldIndex].toString() : undefined,
      data: visibleColumnIndices.map(i => row[i])
    }));

    return { columns, rows };
  }

  public getRowIdx(id: string): number {
    const idIdx = this.getIdFieldIndex();
    if (idIdx < 0) return -1;
    for (let i = 0; i < this._rows.length; i++) {
      if (this._rows[i][idIdx] === id) return i;
    }
    return -1;
  }

  public setRow(rowIdx: number, row: TableRow) {
    if (row.length !== this._columns.length) throw new Error('Row and column length mismatched');
    this._rows[rowIdx] = row;
  }

  public setData(rowIdx: number, colIdx: number, value: any) {
    this._rows[rowIdx][colIdx] = tableFormatValue(this._columns[colIdx], value);
  }

  public objectifyRow<T = any>(row: TableRow): T {
    const obj = {};
    for (let i = 0; i < this._columns.length; i++) {
      obj[this._columns[i].name] = row[i];
    }
    return obj as T;
  }
};
