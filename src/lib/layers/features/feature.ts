import type { AppObjectLayer } from '../object';
import { AppGeoJSONLayer } from './geojson';
import { AppWKXLayer } from './wkx';

export enum AppFeatureLayerDataType {
  Unknown = 0,
  GeoJSON = 1,
  WKX = 2
};

export class AppFeatureLayer {
  private constructor() {}

  public static rawToType(raw: string): AppFeatureLayerDataType {
    if (AppGeoJSONLayer.rawIsValid(raw)) return AppFeatureLayerDataType.GeoJSON;
    if (AppWKXLayer.rawIsValid(raw)) return AppFeatureLayerDataType.WKX;
    return AppFeatureLayerDataType.Unknown;
  }

  public static createFromRaw(name: string, raw: string): AppObjectLayer {
    const type = AppFeatureLayer.rawToType(raw);
    if (type === AppFeatureLayerDataType.GeoJSON) return new AppGeoJSONLayer({ name, raw });
    if (type === AppFeatureLayerDataType.WKX) return new AppWKXLayer({ name, raw });
    throw new Error('Unable to create feature layer from given data');
  }
}
