import type { Geometry } from 'geojson';
import type { FeatureGroup, Map } from 'leaflet';
import type { AppFeatureLayerBase } from '../base';
import { EditFeatureGroup } from './base';

export class EditGeometry {
  private readonly _map: Map;

  private _layer: AppFeatureLayerBase|undefined;
  private _featureId: string|undefined;
  private _geometry: Geometry|undefined;
  private _editLayer: EditFeatureGroup|undefined;

  public get layer(): AppFeatureLayerBase|undefined { return this._layer; }
  public get featureId(): string|undefined { return this._featureId; }
  public get geometry(): Geometry|undefined { return this._geometry; }
  public get leaflet(): FeatureGroup|undefined { return this._editLayer; }

  public constructor(map: Map) {
    this._map = map;
  }

  public startEdit(layer: AppFeatureLayerBase, featureId: string) {
    if (!this._map) return;
    this._layer = layer;
    this._featureId = featureId;
    this._geometry = this._layer.getGeometryFromId(this._featureId);
    this._editLayer = new EditFeatureGroup(this._geometry);
    this._layer.hideFeature(this._featureId);
    this._map.addLayer(this._editLayer);
    this._editLayer.bringToFront();
  }

  public stopEdit() {
    if (!this._map) return;
    if (this._editLayer && this._map.hasLayer(this._editLayer)) {
      this._editLayer.remove();
      this._map.removeLayer(this._editLayer);
    }
    if (this._layer && this._featureId) {
      this._layer.showFeature(this._featureId);
    }
    this._layer = undefined;
    this._featureId = undefined;
    this._geometry = undefined;
    this._editLayer = undefined;
  }

  public save() {
    if (!this._editLayer) return;
    this._geometry = this._editLayer.getGeometry();
    this._layer.updateGeometry(this._featureId, this._geometry);
  }
}
