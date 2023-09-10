import { AppObjectLayer } from '../object';
import { FeatureDataTable } from './table';
import { FeatureGroup, Map } from 'leaflet';
import { Geometry as WKXGeometry } from '../../wkx';
import { getDefaultStyle, getFeatureHoveredStyle, getFeatureSelectedStyle, getLayerSelectedStyle, type RendererFeatureGroupStyle, type RendererGeometry } from './renderer/renderer';
import { RendererFeatureGroupCollection } from './renderer/feature-group-collection';
import type { DataTable } from '../../table/table';
import type { FeatureCollection, GeoJsonGeometryTypes } from 'geojson';

export type AttributedFeature = Record<string, any> & { properties: Record<string, any> };

export type AttributesTable = {
  headers: string[],
  body: any[]
};

export abstract class AppFeatureLayerBase<DataType = any> extends AppObjectLayer<FeatureGroup> {
  protected _data: DataType;
  protected _layersCollection: RendererFeatureGroupCollection;

  public url?: string = undefined;
  public defaultStyle: RendererFeatureGroupStyle = getDefaultStyle();
  public layerSelectedStyle: RendererFeatureGroupStyle = getLayerSelectedStyle();
  public featureHoveredStyle: RendererFeatureGroupStyle = getFeatureHoveredStyle();
  public featureSelectedStyle: RendererFeatureGroupStyle = getFeatureSelectedStyle();

  public get data() { return this._data; }

  public constructor(name: string, data: DataType, url?: string) {
    super({ name });
    this._data = data;
    this.url = url;

    const geometries = this.getRendererGeometries();
    this._layersCollection = RendererFeatureGroupCollection.createFromGeometries(geometries);
    this._layersCollection.setAllStyles(this.defaultStyle);
    this.leaflet = new FeatureGroup(this._layersCollection.layers);
  }

  public abstract getFeatureCollection(): FeatureCollection;
  public abstract getRendererGeometries(): RendererGeometry[];
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

  public zoomTo(id: string, map: Map) {
    const layer = this._layersCollection.getFromId(id);
    if (!layer) return;
    map.fitBounds(layer.getBounds());
  }

  public setDefaultStyle(id?: string) {
    if (!id) return this._layersCollection.setAllStyles(this.defaultStyle);
    this._layersCollection.setStyle(id, this.defaultStyle);
  }

  public setLayerSelectedStyle(id?: string) {
    if (!id) return this._layersCollection.setAllStyles(this.layerSelectedStyle);
    this._layersCollection.setStyle(id, this.layerSelectedStyle);
  }

  public setFeatureHoveredStyle(id?: string) {
    if (!id) return this._layersCollection.setAllStyles(this.featureHoveredStyle);
    this._layersCollection.setStyle(id, this.featureHoveredStyle);
  }

  public setFeatureSelectedStyle(id?: string) {
    if (!id) return this._layersCollection.setAllStyles(this.featureSelectedStyle);
    this._layersCollection.setStyle(id, this.featureSelectedStyle);
  }
}
