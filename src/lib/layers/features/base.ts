import { AppObjectLayer } from '../object';
import { FeatureRenderer } from '../feature-renderer';
import { Geometry as WKXGeometry } from '../../wkx';
import type { DataTable } from '../../table';
import type { FeatureCollection, GeoJsonGeometryTypes } from 'geojson';
import { FeatureDataTable } from './table';
import type { FeatureGroup } from 'leaflet';

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

  public getGeometryTypes(): GeoJsonGeometryTypes[] {
    return [...(new Set<GeoJsonGeometryTypes>(this.getFeatureCollection().features.map(x => x.geometry.type)))];
  }
  
  public getFeaturesTable(): FeatureDataTable {
    const table = this.getAttributesTable();
    const geometries = this.getFeatureCollection().features.map(x => WKXGeometry.parseGeoJSON(x.geometry).toWkb());
    return FeatureDataTable.fromDataTable(table, geometries);
  }
}
