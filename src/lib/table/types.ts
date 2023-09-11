export type TableColumnType = 'uuid' | 'string' | 'number' | 'boolean' | 'bytes';

export type TableColumn = {
  name: string,
  type: TableColumnType,
  nullable: boolean,
  hidden?: boolean
};

export type TableCell = string | number | boolean | Uint8Array | null;

export type TableRow = TableCell[];

export type TableDataSourceRow = { id: string|undefined, data: TableRow };
export type TableDataSource = {
  columns: TableColumn[],
  rows: TableDataSourceRow[]
};
