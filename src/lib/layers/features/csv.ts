import { AppFeatureLayer } from './feature';
import { AppFeatureLayerBase } from './base';
import { Buffer } from 'buffer';
import { FeatureDataTable } from './table';
import { Geometry as WKXGeometry } from '../../wkx';
import { DataTable, type TableColumn } from '../../table';
import type { Feature, FeatureCollection, GeoJsonGeometryTypes, Geometry } from 'geojson';
import type { CSVGeometryOptions, CSVOptions } from '../../csv/options';
import { AppGeoJSONLayer } from './geojson';

const DELIMITERS_SET = [',', ';', '\t'];

export type AppCsvLayerData = {
  table: DataTable,
  options: CSVOptions
};

export class AppCSVLayer extends AppFeatureLayerBase<AppCsvLayerData> {
  public constructor(name: string, table: DataTable, options: CSVOptions) {
    if (options.geometry.mode === 'none') {
      throw new Error('This is not a geospatialisable table');
    }
    super(name, { table, options });
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
      if (geometry) features.push({ type: 'Feature', properties: {}, geometry });
    }
    return { type: 'FeatureCollection', features };
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

  public getFeaturesTable(): FeatureDataTable {
    const geometries: Buffer[] = [];
    for (const row of this._data.table.rows) {
      const geometry = this.getGeometry(this._data.table.objectifyRow(row));
      geometries.push(geometry ? WKXGeometry.parseGeoJSON(geometry).toWkb() : Buffer.from([]));
    }
    return new FeatureDataTable(this._data.table.headers, this._data.table.rows, geometries);
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
        const table = DataTable.createFromCsv(preview, { delimiter });
        if (!bestDelimiterTable || bestDelimiterTable.headers.length < table.headers.length) {
          bestDelimiter = delimiter;
          bestDelimiterTable = table;
        }
      } finally { continue; }
    }

    if (!bestDelimiter || !bestDelimiterTable || bestDelimiterTable.headers.length < minColumns) {
      return undefined;
    }
    return {
      options: {
        delimiter: bestDelimiter,
        geometry: this.getGeometryOptionsFromColumns(bestDelimiterTable.headers)
      },
      preview: bestDelimiterTable
    };
  }

  public static createFromRaw(name: string, raw: string, options: CSVOptions): AppCSVLayer {
    return new AppCSVLayer(name, DataTable.createFromCsv(raw, options), options);
  }
}
