import { AppFeatureLayerBase } from '../features/base';
import { Buffer } from 'buffer';
import { Geometry as WKXGeometry } from '../../wkx';
import { LayerWriterBase } from './base';
import { stringify as csvStringify } from 'csv-stringify/browser/esm/sync';
import CsvOptionsModal from './CSVOptionsModal.svelte';
import type { AppLayer } from '../layer';
import type { CSVGeneralOptions, CSVOptions } from '../../csv/options';
import type { ModalComponent } from '@skeletonlabs/skeleton';

export abstract class CSVWriter<T extends CSVGeneralOptions> extends LayerWriterBase<T> {
  protected _optionsModalComponent: ModalComponent = { ref: CsvOptionsModal };

  public constructor() {
    super(
      'CSV',
      'text/csv',
      'csv'
    );
  }

  public abstract getRows(layer: AppLayer, options: T): any[][];

  public getLayerContent(layer: AppLayer, options: T): Uint8Array {
    return Buffer.from(
      csvStringify(
        this.getRows(layer, options), { header: false, delimiter: options.delimiter }
      )
    );
  }
};

export class SpatialCSVWriter extends CSVWriter<CSVOptions> {
  public layerWritable(layer: AppLayer): boolean {
    return layer instanceof AppFeatureLayerBase;
  }

  public getRows(layer: AppLayer, options: CSVOptions): any[][] {
    if (!(layer instanceof AppFeatureLayerBase)) throw new Error('Unsupported layer type');
    const geometryFn = SpatialCSVWriter.getGeometryConversionFunction(options);
    if (!geometryFn) throw new Error('Invalid options');
    const table = layer.getFeaturesTable();
    return [
      [...table.headers.map(x => x.name), 'SHAPE'],
      ...table.rows.map((row, i) => [...row, geometryFn(table.geometries[i])])
    ];
  }

  protected static geometryToGeoJSON(wkbGeometry: Buffer): string {
    return JSON.stringify(WKXGeometry.parse(wkbGeometry).toGeoJSON());
  }

  protected static geometryToWKT(wkbGeometry: Buffer): string {
    return WKXGeometry.parse(wkbGeometry).toWkt();
  }

  protected static geometryToWKBHex(wkbGeometry: Buffer): string {
    return wkbGeometry.toString('hex');
  }

  protected static geometryToWKBBase64(wkbGeometry: Buffer): string {
    return wkbGeometry.toString('base64');
  }

  protected static getGeometryConversionFunction(options: CSVOptions): undefined|((wkb: Buffer) => string) {
    if (!options || !options.geometry) return undefined;
    if (options.geometry.mode === 'geojson') return SpatialCSVWriter.geometryToGeoJSON;
    if (options.geometry.mode === 'wkt') return SpatialCSVWriter.geometryToWKT;
    if (options.geometry.mode === 'wkb' && options.geometry.encoding === 'hex') return SpatialCSVWriter.geometryToWKBHex;
    if (options.geometry.mode === 'wkb' && options.geometry.encoding === 'base64') return SpatialCSVWriter.geometryToWKBBase64;
    return undefined;
  }
};
