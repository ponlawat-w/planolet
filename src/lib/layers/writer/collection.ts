import type { LayerWriterBase } from './base';
import { CSVGeoJSONWriter, CSVWKBBase64Writer, CSVWKBHexWriter, CSVWKTWriter, NonSpatialCSVWriter } from './csv';
import { GeoJSONWriter } from './geojson';
import { PrettyGeoJSONWriter } from './geojson-pretty';

export const WRITERS_COLLECTION: LayerWriterBase[] = [
  new GeoJSONWriter(),
  new PrettyGeoJSONWriter(),
  new NonSpatialCSVWriter(),
  new CSVGeoJSONWriter(),
  new CSVWKTWriter(),
  new CSVWKBHexWriter(),
  new CSVWKBBase64Writer()
];
