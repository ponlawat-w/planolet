import { DataTable, type TableColumn, type TableRow } from '../../table';
import type { Buffer } from 'buffer';

export class FeatureDataTable extends DataTable {
  protected _geometries: Buffer[];

  public get geometries(): Buffer[] { return this._geometries; };

  public constructor(headers: TableColumn[], rows: TableRow[], geometries: Buffer[]) {
    if (rows.length !== geometries.length) {
      throw new Error('Data records lenght must match geometries length.');
    }
    super(headers, rows);
    this._geometries = geometries;
  }

  public static fromDataTable(dataTable: DataTable, geometries: Buffer[]): FeatureDataTable {
    return new FeatureDataTable(dataTable.columns, dataTable.rows, geometries);
  }
}
