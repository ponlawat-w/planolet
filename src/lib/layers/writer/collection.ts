import type { LayerWriterBase } from './base';
import { SpatialCSVWriter } from './csv';
import { GeoJSONWriter } from './geojson';

export const WRITERS_COLLECTION: LayerWriterBase[] = [
  new GeoJSONWriter(),
  new SpatialCSVWriter()
];
