import { TileLayer, type Map } from 'leaflet';
import { AppMapLayerType, type AppMapLayer, removeLayerIndex } from './default';
import { v4 } from 'uuid';

export type AppBasemapLayerOptions = {
  url: string
};

export type AppBasemapLayer = AppMapLayer & {
  type: AppMapLayerType.BasemapLayer,
  pane?: string,
  options: AppBasemapLayerOptions
};

export const createBasemapLayer = (name: string, url: string): AppBasemapLayer => ({
  name,
  type: AppMapLayerType.BasemapLayer,
  visible: true,
  leafletLayer: new TileLayer(url),
  options: { url }
});

export const reorderBasemapLayers = (map: Map, layers: AppBasemapLayer[]) => {
  let i = 0;
  for (const layer of layers) if (layer.leafletLayer && map.hasLayer(layer.leafletLayer)) {
    const pane = map.getPane(layer.pane);
    if (!pane) {
      continue;
    }
    const zIndex = 200 + layers.length - i++;
    pane.style.zIndex = zIndex.toString();
  }
};

export const addBasemapLayer = (map: Map, layers: AppBasemapLayer[], newLayer: AppBasemapLayer): AppBasemapLayer[] => {
  if (!map || map.hasLayer(newLayer.leafletLayer)) {
    return;
  }
  newLayer.pane = v4();
  map.createPane(newLayer.pane);
  newLayer.leafletLayer.options.pane = newLayer.pane;
  map.addLayer(newLayer.leafletLayer);
  layers = [newLayer, ...layers];
  return layers;
};

export const removeBasemapLayerIndex = (map: Map, layers: AppBasemapLayer[], index: number): AppBasemapLayer[] => {
  const pane = map.getPane(layers[index].pane);
  if (pane) {
    pane.remove();
  }
  return removeLayerIndex<AppBasemapLayer>(map, layers, index);
};

export const removeBasemapLayer = (map: Map, layers: AppBasemapLayer[], layer: AppBasemapLayer): AppBasemapLayer[] => {
  const index = layers.indexOf(layer);
  return removeBasemapLayerIndex(map, layers, index);
};

export const basemapLayerUrlValid = (url: string): boolean =>
  (url.startsWith('http://') || url.startsWith('https://')) && url.includes('{x}') && url.includes('{y}') && url.includes('z');

