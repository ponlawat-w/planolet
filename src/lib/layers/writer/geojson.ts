import type { Feature, FeatureCollection } from 'geojson';
import { Geometry as WKXGeometry } from '../../wkx';
import { AppFeatureLayerBase } from '../features/base';
import { AppGeoJSONLayer } from '../features/geojson';
import type { AppLayer } from '../layer';
import { LayerWriterBase } from './base';
import { Buffer } from 'buffer';
import type { ModalComponent } from '@skeletonlabs/skeleton';
import GeoJsonOptionsModal from './GeoJSONOptionsModal.svelte';

export type GeoJSONWriterOptions = {
  pretty: boolean,
  space?: number
};

export class GeoJSONWriter extends LayerWriterBase<GeoJSONWriterOptions> {
  protected _optionsModalComponent: ModalComponent = {
    ref: GeoJsonOptionsModal
  };

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

  public getLayerContent(layer: AppLayer, options: GeoJSONWriterOptions): Uint8Array {
    return Buffer.from(
      JSON.stringify(
        GeoJSONWriter.getFeatureCollection(layer),
        undefined,
        options && options.pretty && options.space ? (options.space ?? 2) : undefined
      )
    );
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
