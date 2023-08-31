import type { Feature, FeatureCollection, MultiPoint, Point } from 'geojson';
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

const getFeatureCollectionLayer = (featureCollection: FeatureCollection): Layer => {
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
  featureCollection: FeatureCollection
};

export type AppFeatureLayer = AppMapLayer & {
  type: AppMapLayerType.FeatureLayer,
  options: AppFeatureLayerOptions
}

export const createFeatureLayer = (name: string, featureCollection: FeatureCollection, url?: string): AppObjectLayer => ({
  name,
  type: AppMapLayerType.FeatureLayer,
  visible: true,
  leafletLayer: getFeatureCollectionLayer(featureCollection),
  options: { featureCollection, url }
});

export const getGeometryType = (layer: AppFeatureLayer): string => {
  if (!layer || !layer.options.featureCollection || !layer.options.featureCollection.features.length) {
    return 'Empty';
  }
  let type: string = undefined;
  for (const feature of layer.options.featureCollection.features) {
    if (type && feature.geometry.type !== type) {
      return 'Mixed';
    }
    type = feature.geometry.type;
  }
  return type;
};

export const getFeaturesCount = (layer: AppFeatureLayer): number => layer && layer.options.featureCollection ? layer.options.featureCollection.features.length : 0;
