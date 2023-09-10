import { AppFeatureLayerBase } from './base';
import { DataTable } from '../../table';
import { v4 } from 'uuid';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { RendererGeometry } from './renderer/renderer';

type FeatureProperties = { '__FEATURE_ID__': string } & Record<string, any>;
export type AppGeoJSONLayerData = FeatureCollection<Geometry, FeatureProperties> | Feature<Geometry, FeatureProperties> | Geometry;

const ID_FIELD = '__FEATURE_ID__';

export class AppGeoJSONLayer extends AppFeatureLayerBase<AppGeoJSONLayerData> {
  protected _singleGeometryFeatureId: string|undefined = undefined;

  public constructor(param: { name: string, raw?: string, data?: AppGeoJSONLayerData }) {
    if (param.raw && AppGeoJSONLayer.rawIsValid(param.raw)) {
      super(param.name, JSON.parse(param.raw));
    } else if (param.data) {
      super(param.name, param.data);
    } else {
      throw new Error('Invalid parameter');
    }
  }

  private setFeatureIds() {
    if (this._data.type === 'Feature') {
      this._data.properties.__FEATURE_ID__ = v4();
    } else if (this._data.type === 'FeatureCollection') {
      for (const feature of this._data.features) {
        feature.properties.__FEATURE_ID__ = v4();
      }
    } else {
      this._singleGeometryFeatureId = v4();
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

  public getRendererGeometries(): RendererGeometry[] {
    this.setFeatureIds();
    if (this._data.type === 'Feature') {
      return [{ id: this._data.properties.__FEATURE_ID__, geometry: this._data.geometry }];
    }
    if (this._data.type === 'FeatureCollection') {
      return this._data.features.map(x => ({ id: x.properties.__FEATURE_ID__, geometry: x.geometry }));
    }
    return [{ id: this._singleGeometryFeatureId, geometry: this._data }];
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
    if (this._data.type === 'Feature') return DataTable.createFromRecords([this._data.properties], ID_FIELD);
    if (this._data.type === 'FeatureCollection') return DataTable.createFromRecords(this._data.features.map(x => x.properties), ID_FIELD);
    return DataTable.createFromRecords([
      { id: this._singleGeometryFeatureId }
    ], 'id');
  }

  public updateAttributes(id: string, record: Record<string, any>): void {
    if (this._data.type === 'Feature') {
      if (this._data.properties[ID_FIELD] !== id) return;
      this._data.properties = { ...this._data.properties, ...record };
    } else if (this._data.type === 'FeatureCollection') {
      const features = this._data.features.filter(x => x.properties[ID_FIELD] === id);
      if (!features.length) return;
      features[0].properties = { ...features[0].properties, ...record };
    }
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
