import { getPrimaryToast } from './toasts';
import { modalStore, toastStore } from '@skeletonlabs/skeleton';
import { TileLayer, type Layer, type Map } from 'leaflet';
import type { ContextLayers, ContextSelectedLayer } from './contexts';
import { v4 } from 'uuid';

export enum LayerType {
  TileLayer,
  FeatureLayer
};

export type TileLayerOptions = {
  url: string
};

export type MapLayerOptions = {
  tileLayer?: TileLayerOptions
};

export type MapLayer = {
  name: string,
  type: LayerType,
  visible: boolean,
  leafletLayer?: Layer,
  pane?: string,
  options: MapLayerOptions
};

export const createLayer = (name: string, type: LayerType, leafletLayer: Layer|undefined, options: MapLayerOptions): MapLayer => ({
  name, type, leafletLayer, options, visible: true
});

export const createTileLayer = (name: string, url: string): MapLayer => createLayer(
  name,
  LayerType.TileLayer,
  new TileLayer(url),
  { tileLayer: { url } }
);

export const reorderLayer = (map: Map, layers: MapLayer[]) => {
  let i = 0;
  for (const layer of layers) if (layer.leafletLayer && map.hasLayer(layer.leafletLayer)) {
    const pane = map.getPane(layer.pane);
    if (!pane) {
      continue;
    }
    pane.style.zIndex = ((layers.length - i++) * 100).toString();
  }
};

export const addLayer = (map: Map, layers: MapLayer[], newLayer: MapLayer): MapLayer[] => {
  if (!map || map.hasLayer(newLayer.leafletLayer)) {
    return;
  }
  newLayer.pane = v4();
  map.createPane(newLayer.pane);
  newLayer.leafletLayer.options.pane = newLayer.pane;
  map.addLayer(newLayer.leafletLayer);
  layers = [newLayer, ...layers];
  reorderLayer(map, layers);
  return layers;
};

export const removeLayerIndex = (map: Map, layers: MapLayer[], index: number): MapLayer[] => {
  if (!map || index < 0 || index >= layers.length) {
    return;
  }
  if (map.hasLayer(layers[index].leafletLayer)) {
    map.removeLayer(layers[index].leafletLayer);
  }
  map.getPane(layers[index].pane).remove();
  const newLayers = [...layers];
  newLayers.splice(index, 1);
  reorderLayer(map, layers);
  return newLayers;
};

export const removeLayer = (map: Map, layers: MapLayer[], layer: MapLayer): MapLayer[] => {
  const index = layers.indexOf(layer);
  return removeLayerIndex(map, layers, index);
};

export const hideLayer = (map: Map, layer: MapLayer) => {
  if (!map || !map.hasLayer(layer.leafletLayer)) {
    return;
  }
  map.removeLayer(layer.leafletLayer);
};

export const showLayer = (map: Map, layer: MapLayer) => {
  if (!map || map.hasLayer(layer.leafletLayer)) {
    return;
  }
  map.addLayer(layer.leafletLayer);
};

export const toggleLayerVisibility = (layer: MapLayer, map: Map, layersContext: ContextLayers) => {
  layersContext.update(layers => layers);
  if (layer.visible) {
    layer.visible = false;
    hideLayer(map, layer);
    return;
  }
  layer.visible = true;
  showLayer(map, layer);
};

export const askToRemoveLayer = (
  layer: MapLayer,
  map: Map,
  layersContext:
  ContextLayers,
  selectedLayerContext: ContextSelectedLayer
) => {
  modalStore.trigger({
    type: 'confirm',
    title: '<i class="fa fa-exclamation-triangle"></i> Layer Delete Confirmation',
    body: `Do you want to remove "${layer.name}"?`,
    buttonTextConfirm: 'Yes',
    buttonTextCancel: 'No',
    response: (confirm: boolean) => {
      if (!confirm) {
        return;
      }
      selectedLayerContext.update(selectedLayer => selectedLayer === layer ? undefined : selectedLayer)
      layersContext.update(layers => removeLayer(map, layers, layer));
      toastStore.trigger(getPrimaryToast(`Layer "${layer.name}" has been removed from map`));
    }
  });
};

export type NewTileLayerData = {
  url: string
};

export const tileLayerUrlValid = (url: string): boolean =>
  (url.startsWith('http://') || url.startsWith('https://')) && url.includes('{x}') && url.includes('{y}') && url.includes('z');
