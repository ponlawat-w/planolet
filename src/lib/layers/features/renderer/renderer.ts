import { CircleMarker, LatLng, Layer, Polygon as LeafletPolygon, Polyline, type CircleMarkerOptions, type PathOptions } from 'leaflet';
import { RendererFeatureGroup } from './feature-group';
import type { Geometry, LineString, Point, Polygon as GeoJSONPolygon, MultiPoint, MultiLineString, MultiPolygon } from 'geojson';
import { RendererFeatureGroupCollection } from './feature-group-collection';

export type RendererGeometry = { id: string, geometry: Geometry };
export type RendererFeatureGroupStyle = { pointStyle: CircleMarkerOptions, lineStringStyle: PathOptions, polygonStyle: PathOptions };

export const getDefaultStyle = (): RendererFeatureGroupStyle => ({
  pointStyle: { fill: true, fillColor: '#ff0000', radius: 4, stroke: false, fillOpacity: 1 },
  lineStringStyle: { fill: false, stroke: true, color: '#ff0000', weight: 2 },
  polygonStyle: { fill: true, fillColor: '#aa0000', weight: 2, stroke: true, color: '#ff0000', fillOpacity: 1 }
});
export const getHoveredStyle = (): RendererFeatureGroupStyle => ({
  pointStyle: { fill: true, fillColor: '#0000ff', radius: 4, stroke: false, fillOpacity: 1 },
  lineStringStyle: { fill: false, stroke: true, color: '#0000ff', weight: 2 },
  polygonStyle: { fill: true, fillColor: '#0000aa', weight: 2, stroke: true, color: '#0000ff', fillOpacity: 1 }
});
export const getSelectedStyle = (): RendererFeatureGroupStyle => ({
  pointStyle: { fill: true, fillColor: '#ff00ff', radius: 4, stroke: false, fillOpacity: 1 },
  lineStringStyle: { fill: false, stroke: true, color: '#00ff00', weight: 2 },
  polygonStyle: { fill: true, fillColor: '#aa00aa', weight: 2, stroke: true, color: '#ff00ff', fillOpacity: 1 }
});

export class FeatureRenderer {
  private constructor() {}

  public static pointToLayer(point: Point): CircleMarker {
    return new CircleMarker([point.coordinates[1], point.coordinates[0]]);
  }

  public static multiPointToLayer(multipoint: MultiPoint): CircleMarker[] {
    return multipoint.coordinates.map(coordinates => new CircleMarker(new LatLng(coordinates[1], coordinates[0])));
  }

  public static lineStringToLayer(lineString: LineString): Polyline {
    return new Polyline(lineString.coordinates.map(x => new LatLng(x[1], x[0])));
  }

  public static multiLineStringToLayer(lineString: MultiLineString): Polyline {
    return new Polyline(
      lineString.coordinates.map(line => line.map(coordinates => new LatLng(coordinates[1], coordinates[0])))
    );
  }

  public static polygonToLayer(polygon: GeoJSONPolygon): LeafletPolygon {
    return new LeafletPolygon(
      polygon.coordinates.map(ring => ring.map(coor => new LatLng(coor[1], coor[0])))
    );
  }

  public static multiPolygonToLayer(multiPolygon: MultiPolygon): LeafletPolygon {
    return new LeafletPolygon(
      multiPolygon.coordinates.map(polygon => polygon.map(ring => ring.map(coor => new LatLng(coor[1], coor[0]))))
    );
  }

  public static geometryToLayers(geometry: Geometry): Layer[] {
    if (geometry.type === 'Point') return [FeatureRenderer.pointToLayer(geometry)];
    if (geometry.type === 'MultiPoint') return FeatureRenderer.multiPointToLayer(geometry);
    if (geometry.type === 'LineString') return [FeatureRenderer.lineStringToLayer(geometry)];
    if (geometry.type === 'MultiLineString') return [FeatureRenderer.multiLineStringToLayer(geometry)];
    if (geometry.type === 'Polygon') return [FeatureRenderer.polygonToLayer(geometry)];
    if (geometry.type === 'MultiPolygon') return [FeatureRenderer.multiPolygonToLayer(geometry)];
    if (geometry.type === 'GeometryCollection') return geometry.geometries.map(x => FeatureRenderer.geometryToLayers(x)).flat();
    throw new Error('Unknown GeoJSON type');
  }
};
