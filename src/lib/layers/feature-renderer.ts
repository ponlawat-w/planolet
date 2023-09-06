import { CircleMarker, LatLng, FeatureGroup, Layer, geoJSON as leafletGeoJSON } from 'leaflet';
import type { FeatureCollection, Geometry } from 'geojson';

export class FeatureRenderer {
  private constructor() {}

  private static coordinatesToLayer (coordinates: number[]): CircleMarker {
    return new CircleMarker(
      new LatLng(coordinates[1], coordinates[0]), {
        fill: true,
        fillColor: '#ff0000',
        radius: 4,
        stroke: false,
        fillOpacity: 1
      }
    );
  }

  private static geometryToLayers (geometry: Geometry): Layer[] {
    if (geometry.type === 'Point') {
      return [FeatureRenderer.coordinatesToLayer(geometry.coordinates)];
    }
    if (geometry.type === 'MultiPoint') {
      return geometry.coordinates.map(x => FeatureRenderer.coordinatesToLayer(x));
    }
    if (geometry.type === 'GeometryCollection') {
      return geometry.geometries.map(x => FeatureRenderer.geometryToLayers(x)).flat();
    }
    return [leafletGeoJSON(geometry)];
  };

  public static featureCollectionToLeaflet(featureCollection: FeatureCollection): FeatureGroup {
    const layers: Layer[] = [];
    for (const feature of featureCollection.features) {
      layers.push(...FeatureRenderer.geometryToLayers(feature.geometry));
    }
    return new FeatureGroup(layers);
  }
};
