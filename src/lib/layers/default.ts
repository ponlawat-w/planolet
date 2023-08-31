import type { Layer, Map } from 'leaflet';
import { removeBasemapLayer, type AppBasemapLayer } from './basemap';
import { removeObjectLayer, type AppObjectLayer } from './object';
import type { ContextLayers, ContextSelectedLayer } from '../contexts';
import { modalStore, toastStore } from '@skeletonlabs/skeleton';
import { getPrimaryToast } from '../toasts';

export enum AppMapLayerType {
  BasemapLayer,
  FeatureLayer
};

export type AppMapLayer = {
  name: string,
  type: AppMapLayerType,
  visible: boolean,
  leafletLayer?: Layer
};

export const removeLayerIndex = <T extends (AppBasemapLayer|AppObjectLayer)>(map: Map, layers: T[], index: number): T[] => {
  if (!map || index < 0 || index >= layers.length || !layers[index].leafletLayer) {
    return layers;
  }
  if (map.hasLayer(layers[index].leafletLayer)) {
    map.removeLayer(layers[index].leafletLayer);
  }
  const newLayers = [...layers];
  newLayers.splice(index, 1);
  return newLayers;
};

export const hideLayer = (map: Map, layer: AppMapLayer) => {
  if (!map || !map.hasLayer(layer.leafletLayer)) {
    return;
  }
  map.removeLayer(layer.leafletLayer);
};

export const showLayer = (map: Map, layer: AppMapLayer) => {
  if (!map || map.hasLayer(layer.leafletLayer)) {
    return;
  }
  map.addLayer(layer.leafletLayer);
};

export const askToRemoveLayer = (
  layer: AppMapLayer,
  map: Map,
  layersContext: ContextLayers,
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
      layersContext.update(layers => {
        if (layer.type === AppMapLayerType.BasemapLayer) {
          return { ...layers, basemaps: removeBasemapLayer(map, layers.basemaps, layer as AppBasemapLayer) };
        }
        if (layer.type === AppMapLayerType.FeatureLayer) {
          return { ...layers, objects: removeObjectLayer(map, layers.objects, layer as AppObjectLayer) };
        }
        return layers;
      });
      toastStore.trigger(getPrimaryToast(`Layer "${layer.name}" has been removed from map`));
    }
  });
};

export const toggleLayerVisibility = (layer: AppMapLayer, map: Map, layersContext: ContextLayers) => {
  layersContext.update(layers => layers);
  if (layer.visible) {
    layer.visible = false;
    hideLayer(map, layer);
    return;
  }
  layer.visible = true;
  showLayer(map, layer);
};
