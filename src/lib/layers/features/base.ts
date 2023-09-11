import { AppObjectLayer } from '../object';
import { FeatureDataTable } from '../../table/feature';
import { FeatureGroup, Map } from 'leaflet';
import { Geometry as WKXGeometry } from '../../wkx';
import { getDefaultStyle, getFeatureHoveredStyle, getFeatureSelectedStyle, getLayerSelectedStyle, type RendererFeatureGroupStyle, type RendererGeometry } from './renderer/renderer';
import { RendererFeatureGroupCollection } from './renderer/feature-group-collection';
import type { DataTable } from '../../table/table';
import type { FeatureCollection, GeoJsonGeometryTypes, Geometry } from 'geojson';
import type { TableColumn } from '../../table/types';

export type AttributedFeature = Record<string, any> & { properties: Record<string, any> };

export type AttributesTable = {
  headers: string[],
  body: any[]
};

export abstract class AppFeatureLayerBase<DataType = any> extends AppObjectLayer<FeatureGroup> {
  protected _idField: string = '__FEATURE_ID__';
  protected _data: DataType;
  protected _layersCollection: RendererFeatureGroupCollection;

  public url?: string = undefined;
  public defaultStyle: RendererFeatureGroupStyle = getDefaultStyle();
  public layerSelectedStyle: RendererFeatureGroupStyle = getLayerSelectedStyle();
  public featureHoveredStyle: RendererFeatureGroupStyle = getFeatureHoveredStyle();
  public featureSelectedStyle: RendererFeatureGroupStyle = getFeatureSelectedStyle();

  public get idField() { return this._idField; }
  public get data() { return this._data; }

  public constructor(name: string, data: DataType, url?: string) {
    super({ name });
    this._data = data;
    this.url = url;

    const geometries = this.getRendererGeometries();
    this._layersCollection = RendererFeatureGroupCollection.createFromGeometries(geometries);
    this._layersCollection.setAllStyles(this.defaultStyle);
    this.leaflet = new FeatureGroup(this._layersCollection.layers);
    this.bindEvents();
  }

  public abstract getFeatureCollection(): FeatureCollection;
  public abstract getRendererGeometries(): RendererGeometry[];
  public abstract getGeometryTypeText(): string;
  public abstract getFeaturesCount(): number;
  public abstract getAttributesTable(): DataTable;
  public abstract getAttributesTableColumns(): TableColumn[];
  public abstract getRecordFromId(id: string): Record<string, any>|undefined;
  public abstract updateAttributes(id: string, record: Record<string, any>): void;
  public abstract getGeometryFromId(id: string): Geometry;
  public abstract updateGeometry(id: string, geometry: Geometry): void;

  public rerender() {
    this.unbindEvents();
    this._layersCollection = RendererFeatureGroupCollection.createFromGeometries(this.getRendererGeometries());
    this._layersCollection.setAllStyles(this.layerSelectedStyle);
    this.leaflet = new FeatureGroup(this._layersCollection.layers);
    this.bindEvents();
  }

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

  protected unbindEvents() {
    for (const layer of this._layersCollection.layers) {
      layer.removeEventListener('click');
    }
  }

  protected bindEvents() {
    for (const layer of this._layersCollection.layers) {
      layer.addEventListener('click', () => {
        if (!AppFeatureLayerBase.selectedLayerContext || !AppFeatureLayerBase.selectedFeatureIdContext) return;
        AppFeatureLayerBase.selectedLayerContext.set(this);
        AppFeatureLayerBase.selectedFeatureIdContext.set(layer.id);
      });
    }
  }
}
