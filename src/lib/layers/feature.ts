import type { Feature, FeatureCollection, Point } from 'geojson';
import { AppMapLayerType, type AppMapLayer } from './default';
import { Circle, FeatureGroup, LatLng, type Layer } from 'leaflet';
import type { AppObjectLayer } from './object';

const getFeaturePoint = (feature: Feature<Point>): Layer => new Circle(
  new LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]), {
    fill: true,
    fillColor: feature.properties.color ? feature.properties.color : '#ff0000',
    color:  feature.properties.color ? feature.properties.color : '#ff0000',
    radius: 100,
    fillOpacity: 1
  }
);

const getFeatureCollectionLayer = (featureCollection: FeatureCollection): Layer => {
  const layers: Layer[] = [];
  for (const feature of featureCollection.features) {
    switch (feature.geometry.type) {
      case 'Point': layers.push(getFeaturePoint(feature as Feature<Point>)); break;
    }
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
