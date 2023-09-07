import { AppFeatureLayerBase } from '../features/base';
import type { AppLayer } from '../layer';
import { AppTableLayer } from '../table';
import { LayerWriterBase } from './base';
import { stringify as csvStringify } from 'csv-stringify/browser/esm/sync';
import { Geometry as WKXGeometry } from '../../wkx';
import { Buffer } from 'buffer';

export abstract class CSVWriterBase extends LayerWriterBase {
  public constructor(name: string) {
    super(
      name,
      'text/csv',
      'csv'
    );
  }

  public abstract getRows(layer: AppLayer): any[][];

  public getLayerContent(layer: AppLayer): Uint8Array {
    return Buffer.from(csvStringify(this.getRows(layer), { header: false, delimiter: ',' }));
  }
};

export class NonSpatialCSVWriter extends CSVWriterBase {
  public constructor() { super('CSV'); }

  public layerWritable(layer: AppLayer): boolean {
    return layer instanceof AppTableLayer;
  }

  public getRows(layer: AppLayer): any[][] {
    if (!(layer instanceof AppTableLayer)) throw new Error('Unsupported layer type');
    return [
      layer.data.headers.map(x => x.name),
      ...layer.data.rows
    ];
  }
};

export abstract class SpatialCSVWriter extends CSVWriterBase {
  public layerWritable(layer: AppLayer): boolean {
    return layer instanceof AppFeatureLayerBase;
  }

  public abstract toGeometryValue(data: Buffer): string;

  public getRows(layer: AppLayer): any[][] {
    if (!(layer instanceof AppFeatureLayerBase)) throw new Error('Unsupported layer type');
    const table = layer.getFeaturesTable();
    return [
      [...table.headers.map(x => x.name), 'SHAPE'],
      ...table.rows.map((row, i) => [...row, this.toGeometryValue(Buffer.from(table.geometries[i]))])
    ];
  }
};

export class CSVGeoJSONWriter extends SpatialCSVWriter {
  public constructor() { super('CSV - shape as GeoJSON'); }

  public toGeometryValue(data: Buffer): string {
    return JSON.stringify(WKXGeometry.parse(data).toGeoJSON());
  }
};

export class CSVWKTWriter extends SpatialCSVWriter {
  public constructor() { super('CSV - shape as WKT'); }

  public toGeometryValue(data: Buffer): string {
    return WKXGeometry.parse(data).toWkt();
  }
};

export class CSVWKBHexWriter extends SpatialCSVWriter {
  public constructor() { super('CSV - shape as WKB (hex)'); }

  public toGeometryValue(data: Buffer): string {
    return data.toString('hex');
  }
};

export class CSVWKBBase64Writer extends SpatialCSVWriter {
  public constructor() { super('CSV - shape as WKB (base64)'); }

  public toGeometryValue(data: Buffer): string {
    return data.toString('base64');
  }
};
