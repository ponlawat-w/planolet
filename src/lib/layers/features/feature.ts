import { DataTable, type CSVGeospaitaliseOptions } from '../../table';
import { AppGeoJSONLayer } from './geojson';
import { AppWKXLayer } from './wkx';
import type { AppFeatureLayerBase } from './base';
import { AppCSVLayer } from './csv';

export enum AppFeatureLayerDataType {
  Unknown = 0,
  GeoJSON = 1,
  WKX = 2,
  CSV = 3
};

export class AppFeatureLayer {
  private constructor() {}

  public static rawToType(raw: string): AppFeatureLayerDataType {
    if (AppGeoJSONLayer.rawIsValid(raw)) return AppFeatureLayerDataType.GeoJSON;
    if (AppWKXLayer.rawIsValid(raw)) return AppFeatureLayerDataType.WKX;
    if (DataTable.validateCsvContent(raw)) return AppFeatureLayerDataType.CSV;
    return AppFeatureLayerDataType.Unknown;
  }

  public static createFromRaw(name: string, raw: string, csvOptions?: CSVGeospaitaliseOptions): AppFeatureLayerBase {
    const type = AppFeatureLayer.rawToType(raw);
    if (type === AppFeatureLayerDataType.GeoJSON) return new AppGeoJSONLayer({ name, raw });
    if (type === AppFeatureLayerDataType.WKX) return new AppWKXLayer({ name, raw });
    if (type === AppFeatureLayerDataType.CSV && csvOptions) return new AppCSVLayer(name, DataTable.createFromCsv(raw), csvOptions);
    throw new Error('Unable to create feature layer from given data');
  }
}
