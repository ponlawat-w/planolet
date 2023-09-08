import { AppFeatureLayer } from './feature';
import { AppFeatureLayerBase } from './base';
import { Buffer } from 'buffer';
import { FeatureDataTable } from './table';
import { Geometry as WKXGeometry } from '../../wkx';
import type { DataTable } from '../../table';
import type { Feature, FeatureCollection, GeoJsonGeometryTypes, Geometry } from 'geojson';

export type CSVGeospaitaliseOptions = {
  delimiter: string,
  geometry: {
    xColumn?: string,
    yColumn?: string,
    geometryColumn?: string
  }
};

export type AppCsvLayerData = {
  table: DataTable,
  options: CSVGeospaitaliseOptions
};

export const getDefaultCsvTableOptions = (): CSVGeospaitaliseOptions => ({
  delimiter: ',',
  geometry: undefined
});

export class AppCSVLayer extends AppFeatureLayerBase<AppCsvLayerData> {
  public constructor(name: string, table: DataTable, options: CSVGeospaitaliseOptions) {
    if (!options.geometry) {
      throw new Error('This is not a geospatialisable table');
    }
    super(name, { table, options });
  }

  public getGeometry(row: any): Geometry|undefined {
    const geomOptions = this._data.options.geometry;
    if (geomOptions.geometryColumn) {
      const subCollection = AppFeatureLayer.createFromRaw('', row[geomOptions.geometryColumn]).getFeatureCollection();
      if (subCollection.features.length) {
        return subCollection.features[0].geometry;
      }
    } else if (geomOptions.xColumn && geomOptions.yColumn) {
      return { type: 'Point', coordinates: [row[geomOptions.xColumn], row[geomOptions.yColumn]] };
    }
    return undefined;
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
}
