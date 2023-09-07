import { DataTable } from '../../table';
import { AppFeatureLayerBase } from './base';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

export type AppGeoJSONLayerData = FeatureCollection|Feature|Geometry;

export class AppGeoJSONLayer extends AppFeatureLayerBase<AppGeoJSONLayerData> {
  public constructor(param: { name: string, raw?: string, data?: AppGeoJSONLayerData }) {
    if (param.raw && AppGeoJSONLayer.rawIsValid(param.raw)) {
      super(param.name, JSON.parse(param.raw));
    } else if (param.data) {
      super(param.name, param.data);
    } else {
      throw new Error('Invalid parameter');
    }
  }

  public getFeatureCollection(): FeatureCollection {
    if (this._data.type === 'FeatureCollection') return this._data;
    if (this._data.type === 'Feature') return { type: 'FeatureCollection', features: [this._data] };
    return {
      type: 'FeatureCollection',
      features: [{
        type: this._data.type as any,
        properties: {},
        geometry: this._data as Geometry
      }]
    }
  }

  public getGeometryTypeText(): string {
    if (this._data.type === 'FeatureCollection') {
      let type: string;
      for (const feature of this._data.features) {
        if (type && feature.geometry.type !== type) {
          return 'Mixed Feature Collection';
        }
        type = feature.geometry.type;
      }
      return `${type ?? 'Empty'} Feature Collection`;
    }
    if (this._data.type === 'Feature') {
      return `Single ${this._data.geometry.type} Feature`;
    }
    if (this._data.type) {
      return `Single ${this._data.type} Geometry`;
    }
    return 'Unknown';
  }

  public getFeaturesCount(): number {
    return this._data.type === 'FeatureCollection' ? this._data.features.length : 1;
  }

  public getAttributesTable(): DataTable {
    if (this._data.type === 'Feature') return DataTable.createFromRecords([this._data.properties]);
    if (this._data.type === 'FeatureCollection') return DataTable.createFromRecords(this._data.features.map(x => x.properties));
    return DataTable.createFromRecords([]);
  }

  public static rawIsValid(raw: string): boolean {
    try {
      const data = JSON.parse(raw);
      if (!data.type) return false;
      if (data.type === 'FeatureCollection') return true;
      if (data.type === 'Feature') return true;
      if (data.type === 'Point') return true;
      if (data.type === 'MultiPoint') return true;
      if (data.type === 'LineString') return true;
      if (data.type === 'MultiLineString') return true;
      if (data.type === 'Polygon') return true;
      if (data.type === 'MultiPolygon') return true;
      if (data.type === 'GeometryCollection') return true;
      return false;
    } catch { return false; }
  }
};
