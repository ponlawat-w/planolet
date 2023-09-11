import { DataTable } from './table';
import { parse as parseCsv } from 'csv/browser/esm/sync';
import type { CSVGeneralOptions } from '../csv/options';
import type { TableCell, TableColumn, TableColumnType, TableRow } from './types';
import { validate as validateUUID } from 'uuid';

const tableGetNewCoumnType = (value: any): TableColumnType => {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'string';
};

const tableGetUpdatedColumnType = (column: TableColumn, value: any): TableColumnType => {
  if (typeof value === 'number' && column.type !== 'number') {
    return 'string';
  }
  if (typeof value === 'boolean' && column.type !== 'boolean') {
    return 'string';
  }
  return column.type
};

export const tableFormatValue = (column: TableColumn, value: any): TableCell => {
  if (column.type === 'string') {
    if (column.nullable && value === null) throw new Error('Value is null in non-nullable column');
    if (typeof value === 'string') {
      if (value === '') return column.nullable ? null : '';
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') return value.toString();
    return JSON.stringify(value);
  }
  if (column.type === 'boolean') return typeof value === 'boolean' ? value : (value ? true : false) as boolean;
  if (column.type === 'number') {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    if (isNaN(parsed) && !column.nullable) throw new Error('Unable to convert value into number');
    return isNaN(parsed) ? null : parsed;
  }
  if (column.type === 'uuid') {
    const valid = validateUUID(value.toString());
    if (!valid && !column.nullable) throw new Error('Unable to convert value into UUID');
    return valid ? value.toString() : null;
  }
  if (column.type === 'bytes') {
    const valid = value instanceof Uint8Array;
    if (!valid && !column.nullable) throw new Error('Value are not bytes');
    return value;
  }
  if (!column.nullable && value === null) throw new Error('Value is null in non-nullable column');
  return value;
};

export const createTableFromRecords = (records: Record<string, any>[], idField?: string): DataTable => {
  const columnsDict: { [name: string]: TableColumn } = {};
  for (const record of records) {
    for (const name of Object.keys(record)) {
      if (!columnsDict[name]) columnsDict[name] = { name, type: tableGetNewCoumnType(record[name]), nullable: true };
      else columnsDict[name].type = tableGetUpdatedColumnType(columnsDict[name], record[name]);
    }
  }
  const columns: TableColumn[] = Object.keys(columnsDict).map(x => columnsDict[x]);
  const rows: TableRow[] = [];
  for (const record of records) {
    const row: TableRow = [];
    for (const column of columns) {
      row.push(tableFormatValue(column, record[column.name]));
    }
    rows.push(row);
  }
  return new DataTable(columns, rows, idField);
};

export const createTableFromCSV = (csvContent: string, options: CSVGeneralOptions, idField?: string): DataTable => {
  let columns: TableColumn[] = undefined;
  const rows: TableRow[] = [];
  for (let row of parseCsv(csvContent, { columns: false, delimiter: options.delimiter, fromLine: 2 }) as string[][]) {
    if (!columns) {
      columns = ((parseCsv(csvContent, { columns: false, delimiter: options.delimiter, toLine: 1 })[0] ?? []) as string[])
        .map((name, i) => ({ name, type: tableGetNewCoumnType(row[i]), nullable: true }));
    } else {
      for (let i = 0; i < columns.length; i++) {
        columns[i].type = tableGetUpdatedColumnType(columns[i], row[i]);
      }
    }
    rows.push(row);
  }
  for (const row of rows) for (let i = 0; i < columns.length; i++) {
    row[i] = tableFormatValue(columns[i], row[i]);
  }
  return new DataTable(columns, rows, idField);
};

export const validateCSVContent = (csvContent: string, options: CSVGeneralOptions, minColumns: number = 1): boolean => {
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
};
