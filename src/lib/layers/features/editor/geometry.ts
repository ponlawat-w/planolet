import type { Geometry, Point } from 'geojson';
import { Marker, FeatureGroup, LatLng, Map } from 'leaflet';
import type { AppFeatureLayerBase } from '../base';

export class EditGeometry {
  private readonly _map: Map;

  private _layer: AppFeatureLayerBase|undefined;
  private _featureId: string|undefined;
  private _geometry: Geometry|undefined;
  private _leaflet: FeatureGroup|undefined;

  public get layer(): AppFeatureLayerBase|undefined { return this._layer; }
  public get featureId(): string|undefined { return this._featureId; }
  public get geometry(): Geometry|undefined { return this._geometry; }
  public get leaflet(): FeatureGroup|undefined { return this._leaflet; }

  public constructor(map: Map) {
    this._map = map;
  }

  public startEdit(layer: AppFeatureLayerBase, featureId: string) {
    if (!this._map) return;
    this._layer = layer;
    this._featureId = featureId;
    this._geometry = this._layer.getGeometryFromId(this._featureId);
    this._leaflet = EditGeometry.getLeafletLayer(this._geometry);
    this._map.addLayer(this._leaflet);
  }

  public stopEdit() {
    if (!this._map) return;
    if (this._leaflet && this._map.hasLayer(this._leaflet)) this._map.removeLayer(this._leaflet);
    this._layer = undefined;
    this._featureId = undefined;
    this._geometry = undefined;
    this._leaflet = undefined;
  }

  public save() {
    const marker = this._leaflet.getLayers()[0] as Marker;
    const latlng = marker.getLatLng();
    (this._geometry as Point).coordinates = [latlng.lng, latlng.lat];
    this._layer.updateGeometry(this._featureId, this._geometry);
  }

  private static getLeafletLayer(geometry: Geometry): FeatureGroup {
    if (geometry.type !== 'Point') throw new Error('Unsupported');
    const layer = new Marker(new LatLng(geometry.coordinates[1], geometry.coordinates[0]), { draggable: true });
    return new FeatureGroup([layer]);
  }
}
