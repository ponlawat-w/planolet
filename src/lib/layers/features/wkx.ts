import { AppFeatureLayerBase } from './base';
import { Buffer } from 'buffer';
import { Geometry } from '../../wkx';
import type { FeatureCollection, Geometry as GeoJSONGeometry } from 'geojson';
import { v4 } from 'uuid';
import type { RendererGeometry } from './renderer/renderer';
import type { TableColumn } from '../../table/types';
import { createTableFromRecords } from '../../table/utils';
import type { DataTable } from '../../table/table';

export type WKXFeatureBase = { id: string };

export type WKTFeature = WKXFeatureBase & {
  type: 'WKT',
  data: string
};

export type WKBFeature = WKXFeatureBase & {
  type: 'WKB',
  encoding: 'hex'|'base64',
  data: Buffer
};

export type WKXFeature = WKTFeature|WKBFeature;

export type WKXFeatures = WKXFeature[];

export class AppWKXLayer extends AppFeatureLayerBase<WKXFeatures> {
  public constructor(param: { name: string, raw?: string, data?: WKXFeatures }) {
    if (param.raw && AppWKXLayer.rawIsValid(param.raw)) {
      super(param.name, AppWKXLayer.rawToData(param.raw));
    } else if (param.data) {
      super(param.name, param.data);
    } else {
      throw new Error('Invalid parameters');
    }
  }

  public getFeatureCollection(): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: this._data.map(x => ({
        type: 'Feature',
        properties: { id: x.id },
        geometry: AppWKXLayer.featureToGeoJSON(x)
      }))
    }
  }

  public getRendererGeometries(): RendererGeometry[] {
    return this._data.map(x => ({ id: x.id, geometry: AppWKXLayer.featureToGeoJSON(x) }));
  }

  public getGeometryTypeText(): string {
    let type: string;
    for (const feature of this._data) {
      const featureType = AppWKXLayer.featureToGeoJSON(feature).type;
      if (type && featureType !== type) {
        return `Mixed WKX Collection`;
      }
      type = featureType;
    }
    if (type) {
      return `WKX ${type} Collection`;
    }
    return 'Unknown';
  }

  public getFeaturesCount(): number {
    return this._data.length;
  }

  public getAttributesTable(): DataTable {
    return createTableFromRecords(this._data.map(x => ({ id: x.id })), 'id');
  }

  public getAttributesTableColumns(): TableColumn[] {
    return [{ name: 'id', type: 'uuid', nullable: false, hidden: true }];
  }

  public getRecordFromId(id: string): Record<string, any>|undefined {
    for (const feature of this._data) if (feature.id === id) return { [this._idField]: feature.id };
    return undefined;
  }

  public updateAttributes(): void {
    throw new Error('Attributes table not supported');
  }

  public getFeatureFromId(id: string): WKXFeature {
    const features = this._data.filter(x => x.id === id);
    if (!features.length) throw new Error('ID not found');
    return features[0];
  }

  public getGeometryFromId(id: string): GeoJSONGeometry {
    return AppWKXLayer.featureToGeoJSON(this.getFeatureFromId(id));
  }

  public updateGeometry(id: string, geometry: GeoJSONGeometry): void {
    const idx = this._data.map(x => x.id).indexOf(id);
    if (idx < 0) throw new Error('ID not found');
    const feature = this._data[idx];

    if (feature.type === 'WKT') {
      this._data[idx] = { id, type: 'WKT', data: Geometry.parseGeoJSON(geometry).toWkt() };
    } else if (feature.type === 'WKB') {
      this._data[idx] = { id, type: 'WKB', encoding: feature.encoding, data: Geometry.parseGeoJSON(geometry).toWkb() };
    }
  }

  public static strToWKT(str: string): WKTFeature|undefined {
    try {
      Geometry.parse(str);
      return { type: 'WKT', data: str, id: v4() };
    } catch { return undefined; }
  }

  public static strToHexWKB(str: string): WKBFeature|undefined {
    try {
      return { type: 'WKB', encoding: 'hex', data: Geometry.parse(Buffer.from(str, 'hex')).toWkb(), id: v4() };
    } catch { return undefined; }
  }

  public static strToBase64WKB(str: string): WKBFeature|undefined {
    try {
      return { type: 'WKB', encoding: 'base64', data: Geometry.parse(Buffer.from(str, 'base64')).toWkb(), id: v4() };
    } catch { return undefined; }
  }

  public static strToFeature (str: string): WKXFeature {
    let feature: WKXFeature = AppWKXLayer.strToWKT(str);
    if (feature) return feature;
    feature = AppWKXLayer.strToHexWKB(str);
    if (feature) return feature;
    feature = AppWKXLayer.strToBase64WKB(str);
    if (feature) return feature;
    throw new Error(`Unable to interpret line data: ${str}`);
  }

  public static featureToGeoJSON(feature: WKXFeature): GeoJSONGeometry {
    switch (feature.type) {
      case 'WKT': return Geometry.parse(feature.data).toGeoJSON();
      case 'WKB': return Geometry.parse(Buffer.from(feature.data)).toGeoJSON();
    }
  }

  public static rawToData(raw: string): WKXFeatures {
    return raw.split('\n').map(x => x.trim()).filter(x => x).map(x => AppWKXLayer.strToFeature(x));
  }

  public static rawIsValid(raw: string): boolean {
    try { return AppWKXLayer.rawToData(raw).length > 0; }
    catch { return false; }
  }
};
