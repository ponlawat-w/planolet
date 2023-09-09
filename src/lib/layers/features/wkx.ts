import { AppFeatureLayerBase } from './base';
import { Buffer } from 'buffer';
import { Geometry } from '../../wkx';
import type { FeatureCollection, Geometry as GeoJSONGeometry } from 'geojson';
import { DataTable } from '../../table';
import { v4 } from 'uuid';
import type { RendererGeometry } from './renderer/renderer';

export type WKXFeatureBase = { id: string };

export type WKTFeature = WKXFeatureBase & {
  type: 'WKT',
  data: string
};

export type WKBFeature = WKXFeatureBase & {
  type: 'WKB',
  encoding: 'hex'|'base64',
  data: Uint8Array
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
    return DataTable.createFromRecords(this._data.map(x => ({ id: x.id })), 'id');
  }

  public static strToWKT (str: string): WKTFeature|undefined {
    try {
      Geometry.parse(str);
      return { type: 'WKT', data: str, id: v4() };
    } catch { return undefined; }
  }

  public static strToHexWKB (str: string): WKBFeature|undefined {
    try {
      const bytes = Uint8Array.from(str.match(/.{1,2}/g).map(x => parseInt(x, 16)));
      Geometry.parse(Buffer.from(bytes));
      return { type: 'WKB', encoding: 'hex', data: bytes, id: v4() };
    } catch { return undefined; }
  }

  public static strToBase64WKB (str: string): WKBFeature|undefined {
    try {
      const bytes = Uint8Array.from(atob(str), x => x.charCodeAt(0));
      Geometry.parse(Buffer.from(bytes));
      return { type: 'WKB', encoding: 'base64', data: bytes, id: v4() };
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
