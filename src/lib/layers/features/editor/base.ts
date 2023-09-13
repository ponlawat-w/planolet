import type { GeoJsonGeometryTypes, Geometry } from 'geojson';
import { FeatureGroup } from 'leaflet';
import { EditPoint } from './point';
import { EditPath } from './path';

export class EditFeatureGroup extends FeatureGroup {
  private readonly geometryType: GeoJsonGeometryTypes;

  public constructor(geometry: Geometry) {
    if (geometry.type === 'Point') {
      super([new EditPoint(geometry.coordinates)]);
      this.geometryType = 'Point';
      return;
    }
    if (geometry.type === 'LineString') {
      const points = geometry.coordinates.map(x => new EditPoint(x));
      super([new EditPath(points), ...points]);
      this.geometryType = 'LineString';
      return;
    }
    throw new Error('Unsupported geometry type');
  }

  public getGeometry(): Geometry {
    if (this.geometryType === 'Point') return (this.getLayers()[0] as EditPoint).getGeometry();
    if (this.geometryType === 'LineString') return (this.getLayers()[0] as EditPath).getGeometry();
    throw new Error('???');
  }

  public remove(): this {
    for (const layer of this.getLayers()) {
      layer.remove();
    }
    return super.remove();
  }
}
