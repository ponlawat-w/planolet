import { DataTable, type TableColumn, type TableRow } from '../../table';

export class FeatureDataTable extends DataTable {
  protected _geometries: Uint8Array[];

  public get geometries(): Uint8Array[] { return this._geometries; };

  public constructor(headers: TableColumn[], rows: TableRow[], geometries: Uint8Array[]) {
    if (rows.length !== geometries.length) {
      throw new Error('Data records lenght must match geometries length.');
    }
    super(headers, rows);
    this._geometries = geometries;
  }

  public static fromDataTable(dataTable: DataTable, geometries: Uint8Array[]): FeatureDataTable {
    return new FeatureDataTable(dataTable.headers, dataTable.rows, geometries);
  }
}
