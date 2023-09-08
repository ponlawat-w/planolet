import { AppGeoJSONLayer } from './geojson';
import { AppWKXLayer } from './wkx';
import type { AppFeatureLayerBase } from './base';
import type { CSVOptions } from '../../csv/options';
import { AppCSVLayer } from './csv';

export enum AppFeatureLayerDataType {
  Unknown = 0,
  GeoJSON = 1,
  WKX = 2,
  CSV = 3
};

export class AppFeatureLayer {
  private constructor() {}

  public static rawToType(params: { raw: string, csvOptions?: CSVOptions }): AppFeatureLayerDataType {
    if (AppGeoJSONLayer.rawIsValid(params.raw)) return AppFeatureLayerDataType.GeoJSON;
    if (AppWKXLayer.rawIsValid(params.raw)) return AppFeatureLayerDataType.WKX;
    if (params.csvOptions) return AppFeatureLayerDataType.CSV;
    return AppFeatureLayerDataType.Unknown;
  }

  public static createFromRaw(params: { name: string, raw: string, csvOptions?: CSVOptions }): AppFeatureLayerBase {
    const type = AppFeatureLayer.rawToType(params);
    if (type === AppFeatureLayerDataType.GeoJSON) return new AppGeoJSONLayer(params);
    if (type === AppFeatureLayerDataType.WKX) return new AppWKXLayer(params);
    if (type === AppFeatureLayerDataType.CSV) return AppCSVLayer.createFromRaw(params.name, params.raw, params.csvOptions);
    throw new Error('Unable to create feature layer from given data');
  }
}
