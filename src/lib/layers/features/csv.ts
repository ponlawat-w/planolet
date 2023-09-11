import { AppFeatureLayer } from './feature';
import { AppFeatureLayerBase } from './base';
import { AppGeoJSONLayer } from './geojson';
import { Buffer } from 'buffer';
import { FeatureDataTable } from '../../table/feature';
import { Geometry as WKXGeometry } from '../../wkx';
import type { CSVGeometryOptions, CSVOptions } from '../../csv/options';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { RendererGeometry } from './renderer/renderer';
import type { DataTable } from '../../table/table';
import type { TableColumn } from '../../table/types';
import { createTableFromCSV } from '../../table/utils';

const DELIMITERS_SET = [',', ';', '\t'];
const FEATURE_ID_FIELD = '__FEATURE_ID__';

export type AppCsvLayerData = {
  table: DataTable,
  options: CSVOptions
};

export class AppCSVLayer extends AppFeatureLayerBase<AppCsvLayerData> {
  public constructor(name: string, table: DataTable, options: CSVOptions) {
    if (options.geometry.mode === 'none') {
      throw new Error('This is not a geospatialisable table');
    }
    table.addRowIds(FEATURE_ID_FIELD);
    super(name, { table, options });
    this._idField = FEATURE_ID_FIELD;
    const idFieldIndex = this._data.table.getIdFieldIndex();
    if (idFieldIndex > 0) {
      this._data.table.columns[idFieldIndex].hidden = true;
    }
  }

  public getGeometry(row: any): Geometry|undefined {
    const options = this._data.options.geometry;
    if (options.mode === 'xy') return { type: 'Point', coordinates: [row[options.xColumn], row[options.yColumn]] };
    if (options.mode === 'wkt') return WKXGeometry.parse(row[options.columnName]).toGeoJSON();
    if (options.mode === 'wkb') return WKXGeometry.parse(Buffer.from(row[options.columnName], options.encoding)).toGeoJSON();

    let subCollection: FeatureCollection;
    if (options.mode === 'auto') subCollection = AppFeatureLayer.createFromRaw({ name: '', raw: row[options.columnName] }).getFeatureCollection();
    else if (options.mode === 'geojson') subCollection = new AppGeoJSONLayer({ name: '', raw: row[options.columnName] }).getFeatureCollection();

    return subCollection.features.length ? subCollection.features[0].geometry : undefined;
  }

  public getFeatureCollection(): FeatureCollection {
    const features: Feature[] = [];
    for (const row of this._data.table.rows) {
      const geometry = this.getGeometry(this._data.table.objectifyRow(row));
      if (geometry) features.push({ type: 'Feature', properties: row, geometry });
    }
    return { type: 'FeatureCollection', features };
  }

  public getRendererGeometries(): RendererGeometry[] {
    const idFieldIndex = this._data.table.columns.map(x => x.name).indexOf(FEATURE_ID_FIELD);
    if (idFieldIndex < 0) throw new Error('Features have no IDs');
    return this._data.table.rows.map(x => ({
      id: x[idFieldIndex].toString(),
      geometry: this.getGeometry(this._data.table.objectifyRow(x))
    }));
  }

  public getGeometryTypeText(): string {
    const features = this.getFeatureCollection().features;
    let type: string = undefined;
    for (const feature of features) {
      if (type && type !== feature.geometry.type) {
        return 'Mixed CSV Table';
      }
      type = feature.geometry.type;
    }
    return `${type} CSV Table`;
  }

  public getFeaturesCount(): number {
    return this._data.table.rows.length;
  }
  
  public getAttributesTable(): DataTable {
    return this._data.table;
  }

  public getAttributesTableColumns(): TableColumn[] {
    return this._data.table.columns;
  }

  public getFeaturesTable(): FeatureDataTable {
    const geometries: Buffer[] = [];
    const table = this.getAttributesTable();
    for (const row of table.rows) {
      const geometry = this.getGeometry(table.objectifyRow(row));
      geometries.push(geometry ? WKXGeometry.parseGeoJSON(geometry).toWkb() : Buffer.from([]));
    }
    return new FeatureDataTable(table.columns, table.rows, geometries);
  }

  public getRecordFromId(id: string): Record<string, any>|undefined {
    const idIdx = this._data.table.getIdFieldIndex();
    if (idIdx < 0) return undefined;
    for (const row of this._data.table.rows) if (row[idIdx] === id) return this._data.table.objectifyRow(row);
    return undefined;
  }

  public updateAttributes(id: string, record: Record<string, any>): void {
    const rowIdx = this._data.table.getRowIdx(id);
    if (rowIdx < 0) return;

    for (const column of Object.keys(record)) {
      const colIdx = this._data.table.getColumnIndex(column);
      if (colIdx < 0) continue;
      this._data.table.setData(rowIdx, colIdx, record[column]);
    }
  }

  private static getGeometryOptionsFromColumns(columns: TableColumn[]): CSVGeometryOptions {
    const columnNames = columns.map(x => x.name);
    const geomColumns = columnNames.filter(name => {
      name = name.toLowerCase();
      return name.includes('geom') || name.includes('geojson') || name.includes('wkt') || name.includes('wkb') || name.includes('wkx') || name.includes('shape')
    });
    if (geomColumns.length) {
      return { mode: 'auto', columnName: geomColumns[0] };
    }
    const xColumns = columnNames.filter(name => {
      name = name.toLowerCase();
      return name === 'x' || name.includes('_x') || name.includes('-y') || name.includes('lon') || name.includes('lng')
    });
    const yColumns = columnNames.filter(name => {
      name = name.toLowerCase();
      return name === 'y' || name.includes('_y') || name.includes('-y') || name.includes('lat')
    });
    if (xColumns.length && yColumns.length) {
      return {
        mode: 'xy',
        xColumn: xColumns[0],
        yColumn: yColumns[0]
      };
    }
    return { mode: 'none' };
  }

  public static tryGetOptionsFromRaw(raw: string, minColumns: number = 1): { options: CSVOptions, preview: DataTable }|undefined {
    if (!raw) return undefined;
    const preview = raw.split('\n').splice(0, 6).join('\n');

    let bestDelimiter: string|undefined = undefined;
    let bestDelimiterTable: DataTable|undefined = undefined;

    for (const delimiter of DELIMITERS_SET) {
      try {
        const table = createTableFromCSV(preview, { delimiter });
        if (!bestDelimiterTable || bestDelimiterTable.columns.length < table.columns.length) {
          bestDelimiter = delimiter;
          bestDelimiterTable = table;
        }
      } finally { continue; }
    }

    if (!bestDelimiter || !bestDelimiterTable || bestDelimiterTable.columns.length < minColumns) {
      return undefined;
    }
    return {
      options: {
        delimiter: bestDelimiter,
        geometry: this.getGeometryOptionsFromColumns(bestDelimiterTable.columns)
      },
      preview: bestDelimiterTable
    };
  }

  public static createFromRaw(name: string, raw: string, options: CSVOptions): AppCSVLayer {
    return new AppCSVLayer(name, createTableFromCSV(raw, options), options);
  }
}
