import { AppFeatureLayerBase } from './base';
import { createTableFromRecords } from '../../table/utils';
import { v4 } from 'uuid';
import type { DataTable } from '../../table/table';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { RendererGeometry } from './renderer/renderer';
import type { TableColumn } from '../../table/types';

export type AppGeoJSONLayerData = FeatureCollection | Feature | Geometry;

export class AppGeoJSONLayer extends AppFeatureLayerBase<AppGeoJSONLayerData> {
  protected _columns: TableColumn[];
  protected _singleGeometryFeatureId: string|undefined = undefined;

  public constructor(param: { name: string, raw?: string, data?: AppGeoJSONLayerData }) {
    let data: AppGeoJSONLayerData;
    if (param.raw && AppGeoJSONLayer.rawIsValid(param.raw)) {
      data = JSON.parse(param.raw);
    }

    const idField = '__FEATURE_ID__';
    let singleGeometry = false;
    if (data.type === 'Feature') {
      data.properties[idField] = v4();
    } else if (data.type === 'FeatureCollection') {
      for (const feature of data.features) {
        feature.properties[idField] = v4();
      }
    } else {
      singleGeometry = true;
    }
    
    if (data) {
      super(param.name, data);
    } else {
      throw new Error('Invalid parameter');
    }
    this._idField = idField;

    if (singleGeometry) {
      this._singleGeometryFeatureId = v4();
    }

    this.loadAttributeColumns();
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

  private loadAttributeColumns() {
    this._columns = createTableFromRecords(this.getFeatureCollection().features.map(x => x.properties), this._idField).columns;
  }

  public getRendererGeometries(): RendererGeometry[] {
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

  private getRecords(): Record<string, any>[] {
    if (this._data.type === 'Feature') return [{ ...this._data.properties }];
    if (this._data.type === 'FeatureCollection') return this._data.features.map(x => ({ ...x.properties }));
    return [{ [this._idField]: this._singleGeometryFeatureId }];
  }

  public getAttributesTable(): DataTable {
    return createTableFromRecords(this.getRecords(), this.idField);
  }

  public getAttributesTableColumns(): TableColumn[] {
    return this._columns;
  }

  public getRecordFromId(id: string): Record<string, any>|undefined {
    if (this._data.type === 'FeatureCollection') {
      for (const feature of this._data.features) if (feature.properties[this._idField] === id) return feature.properties;
      return undefined;
    }
    if (this._data.type === 'Feature') {
      return this._data.properties[this._idField] === id ? this._data.properties : undefined;
    }
    if (this._singleGeometryFeatureId === id) return { [this._idField]: id };
    return undefined;
  }

  public updateAttributes(id: string, record: Record<string, any>): void {
    if (this._data.type === 'Feature') {
      if (this._data.properties[this._idField] !== id) return;
      this._data.properties = { ...this._data.properties, ...record };
    } else if (this._data.type === 'FeatureCollection') {
      const features = this._data.features.filter(x => x.properties[this._idField] === id);
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
