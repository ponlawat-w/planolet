import { AppObjectLayer } from '../object';
import { FeatureRenderer } from '../feature-renderer';
import type { FeatureCollection } from 'geojson';
import type { FeatureGroup } from 'leaflet';
import type { DataTable } from '../../table';

export type AttributedFeature = Record<string, any> & { properties: Record<string, any> };

export type AttributesTable = {
  headers: string[],
  body: any[]
};

export abstract class AppFeatureLayerBase<T = any> extends AppObjectLayer {
  public url?: string = undefined;
  protected _data: T;
  declare public leaflet?: FeatureGroup;

  public get data() { return this._data; }

  public constructor(name: string, data: T, url?: string) {
    super({ name });
    this._data = data;
    this.url = url;
    this.leaflet = FeatureRenderer.featureCollectionToLeaflet(this.getFeatureCollection());
  }

  public abstract getFeatureCollection(): FeatureCollection;
  public abstract getGeometryTypeText(): string;
  public abstract getFeaturesCount(): number;
  public abstract getAttributesTable(): DataTable;
}
