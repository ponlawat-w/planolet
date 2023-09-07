import type { AppLayer } from '../layer';
import { GeoJSONWriter } from './geojson';
import { Buffer } from 'buffer';

export class PrettyGeoJSONWriter extends GeoJSONWriter {
  public constructor() {
    super();
    this._name = 'Pretty GeoJSON';
  }

  public getLayerContent(layer: AppLayer): Uint8Array {
    return Buffer.from(JSON.stringify(GeoJSONWriter.getFeatureCollection(layer), undefined, 2));
  }
}
