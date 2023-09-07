import type { Feature, FeatureCollection } from 'geojson';
import { Geometry as WKXGeometry } from '../../wkx';
import { AppFeatureLayerBase } from '../features/base';
import { AppGeoJSONLayer } from '../features/geojson';
import type { AppLayer } from '../layer';
import { LayerWriterBase } from './base';
import { Buffer } from 'buffer';

export class GeoJSONWriter extends LayerWriterBase {
  public constructor() {
    super(
      'GeoJSON',
      'application/json',
      'geojson'
    );
  }

  public layerWritable(layer: AppLayer): boolean {
    return layer instanceof AppFeatureLayerBase;
  }

  public getLayerContent(layer: AppLayer): Uint8Array {
    return Buffer.from(JSON.stringify(GeoJSONWriter.getFeatureCollection(layer)));
  }
  
  public static getFeatureCollection(layer: AppLayer): FeatureCollection {
    if (layer instanceof AppGeoJSONLayer) {
      const data = layer.data;
      if (data.type === 'FeatureCollection') return data;
      if (data.type === 'Feature') return { type: 'FeatureCollection', features: [data] };
      return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: data, properties: {} }] };
    }
    if (layer instanceof AppFeatureLayerBase) {
      const table = layer.getFeaturesTable();
      const features: Feature[] = [];
      for (let i = 0; i < table.rows.length; i++) {
        const properties = table.objectifyRow(table.rows[i]);
        const geometry = WKXGeometry.parse(Buffer.from(table.geometries[i])).toGeoJSON();
        features.push({ type: 'Feature', properties, geometry });
      }
      return { type: 'FeatureCollection', features };
    }
    throw new Error('Invalid layer type');
  }
};
