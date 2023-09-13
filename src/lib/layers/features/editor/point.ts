import { Icon, LatLng, Marker } from 'leaflet';
import type { Point, Position } from 'geojson';

const ICON = new Icon({
  iconUrl: '/assets/geom-edit-marker.png',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
  popupAnchor: [5, 10]
});

export class EditPoint extends Marker {
  public constructor(coordinates: Position) {
    super(new LatLng(coordinates[1], coordinates[0]), {
      draggable: true, icon: ICON
    });
  }

  public getCoordinates(): Position {
    const coordinates = this.getLatLng();
    return [ coordinates.lng, coordinates.lat ];
  }

  public getGeometry(): Point {
    const coordinates = this.getLatLng();
    return { type: 'Point', coordinates: [ coordinates.lng, coordinates.lat ] };
  }
}
