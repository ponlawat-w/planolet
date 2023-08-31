import { removeLayerIndex } from './default';
import type { AppFeatureLayer } from './feature';
import type { FeatureGroup, Map } from 'leaflet';

export type AppObjectLayer = AppFeatureLayer;

export const reorderObjectLayers = (map: Map, layers: AppObjectLayer[]) => {
  for (const layer of layers) if (layer.leafletLayer && map.hasLayer(layer.leafletLayer)) {
    (layer.leafletLayer as FeatureGroup).bringToBack();
  }
};

export const addObjectLayer = (map: Map, layers: AppObjectLayer[], newLayer: AppObjectLayer): AppObjectLayer[] => {
  if (!map || map.hasLayer(newLayer.leafletLayer)) {
    return;
  }
  map.addLayer(newLayer.leafletLayer);
  layers = [newLayer, ...layers];
  return layers;
};

export const removeObjectLayerIndex = (map: Map, layers: AppObjectLayer[], index: number): AppObjectLayer[] =>
  removeLayerIndex<AppObjectLayer>(map, layers, index);

export const removeObjectLayer = (map: Map, layers: AppObjectLayer[], layer: AppObjectLayer): AppObjectLayer[] => {
  const index = layers.indexOf(layer);
  return removeObjectLayerIndex(map, layers, index);
};
