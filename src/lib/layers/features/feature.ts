import { AppCSVLayer, type CSVGeospaitaliseOptions } from './csv';
import { AppGeoJSONLayer } from './geojson';
import { AppWKXLayer } from './wkx';
import { DataTable } from '../../table';
import type { AppFeatureLayerBase } from './base';

export enum AppFeatureLayerDataType {
  Unknown = 0,
  GeoJSON = 1,
  WKX = 2,
  CSV = 3
};

export class AppFeatureLayer {
  private constructor() {}

  public static rawToType(raw: string, minCsvColumnsCount: number = 1): AppFeatureLayerDataType {
    if (AppGeoJSONLayer.rawIsValid(raw)) return AppFeatureLayerDataType.GeoJSON;
    if (AppWKXLayer.rawIsValid(raw)) return AppFeatureLayerDataType.WKX;
    if (DataTable.validateCsvContent(raw, ',', minCsvColumnsCount)) return AppFeatureLayerDataType.CSV;
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
