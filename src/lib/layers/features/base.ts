import { AppObjectLayer } from '../object';
import { FeatureDataTable } from './table';
import { Geometry as WKXGeometry } from '../../wkx';
import { getDefaultStyle, getHoveredStyle, getSelectedStyle, type RendererFeatureGroupStyle, type RendererGeometry } from './renderer/renderer';
import { RendererFeatureGroupCollection } from './renderer/feature-group-collection';
import type { DataTable } from '../../table';
import type { FeatureCollection, GeoJsonGeometryTypes } from 'geojson';
import { FeatureGroup, Map } from 'leaflet';

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
  public hoveredStyle: RendererFeatureGroupStyle = getHoveredStyle();
  public selectedStyle: RendererFeatureGroupStyle = getSelectedStyle();

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

  public setHoverStyle(id?: string) {
    if (!id) return this._layersCollection.setAllStyles(this.hoveredStyle);
    this._layersCollection.setStyle(id, this.hoveredStyle);
  }

  public setSelectedStyle(id?: string) {
    if (!id) return this._layersCollection.setAllStyles(this.selectedStyle);
    this._layersCollection.setStyle(id, this.selectedStyle);
  }
}
