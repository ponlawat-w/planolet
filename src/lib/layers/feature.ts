import type { Feature, FeatureCollection, Geometry, MultiPoint, Point } from 'geojson';
import { AppMapLayerType, type AppMapLayer } from './default';
import { FeatureGroup, LatLng, geoJSON, type Layer, CircleMarker } from 'leaflet';
import type { AppObjectLayer } from './object';

const getFeaturePoint = (feature: Feature<Point>): Layer => new CircleMarker(
  new LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]), {
    fill: true,
    fillColor: '#ff0000',
    radius: 4,
    stroke: false,
    fillOpacity: 1
  }
);

const getLeafletLayerFromFeatureCollection = (featureCollection: FeatureCollection): Layer => {
  const layers: Layer[] = [];
  for (const feature of featureCollection.features) {
    if (feature.geometry.type === 'Point') {
      layers.push(getFeaturePoint(feature as Feature<Point>));
      continue;
    }
    if (feature.geometry.type === 'MultiPoint') {
      for (const coordinates of (feature as Feature<MultiPoint>).geometry.coordinates) {
        layers.push(getFeaturePoint({ type: 'Feature', geometry: { type: 'Point', coordinates }, properties: feature.properties }));
      }
      continue;
    }
    layers.push(geoJSON(feature));
  }
  return new FeatureGroup(layers);
};

export type AppFeatureLayerOptions = {
  url?: string,
  data: FeatureCollection|Feature|Geometry
};

export type AppFeatureLayer = AppMapLayer & {
  type: AppMapLayerType.FeatureLayer,
  options: AppFeatureLayerOptions
}

export const createFeatureLayer = (name: string, data: any, url?: string): AppObjectLayer => ({
  name,
  type: AppMapLayerType.FeatureLayer,
  visible: true,
  leafletLayer: getLeafletLayerFromFeatureCollection(getFeatureCollectionFromObject(data)),
  options: { data, url }
});

export const getGeometryType = (layer: AppFeatureLayer): string => {
  if (!layer || !layer.options.data) {
    return 'Empty';
  }
  if (layer.options.data.type === 'FeatureCollection') {
    let type: string;
    for (const feature of layer.options.data.features) {
      if (type && feature.geometry.type !== type) {
        return 'Mixed Feature Collection';
      }
      type = feature.geometry.type;
    }
    return `${type ?? 'Empty'} Feature Collection`;
  }
  if (layer.options.data.type === 'Feature') {
    return `Single ${layer.options.data.geometry.type} Feature`;
  }
  if (layer.options.data.type) {
    return `Single ${layer.options.data.type} Geometry`;
  }
  return 'Unknown Type'
};

export const getFeaturesCount = (layer: AppFeatureLayer): number => layer && layer.options.data && layer.options.data.type === 'FeatureCollection' ?
  layer.options.data.features.length : 0;

export const getFeatureCollectionFromObject = (obj: any): FeatureCollection => {
  if (!obj.type) throw new Error('Property type is required in the object');
  if (obj.type === 'FeatureCollection') return obj;
  if (obj.type === 'Feature') return { type: 'FeatureCollection', features: [obj] };
  if (
    obj.type === 'Point'
    || obj.type === 'MultiPoint'
    || obj.type === 'LineString'
    || obj.type === 'MultiLineString'
    || obj.type === 'Polygon'
    || obj.type === 'MultiPolygon'
    || obj.type === 'GeometryCollection'
  ) return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: obj,
      properties: {}
    }]
  };
  throw new Error(`Unknown GeoJSON type ${obj.type}`);
};
