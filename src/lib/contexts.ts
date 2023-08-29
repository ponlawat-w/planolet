import type { Map } from 'leaflet';
import type { Writable } from 'svelte/store';
import type { MapLayer } from './layers';
import { getContext } from 'svelte';

export const CONTEXT_MAP = 'map';
export const CONTEXT_LAYERS = 'layers';
export const CONTEXT_SELECTED_LAYER = 'selectedLayer';

export type ContextMap = Writable<Map>;
export type ContextLayers = Writable<MapLayer[]>;
export type ContextSelectedLayer = Writable<MapLayer|undefined>;

export const getMapLayersContext = () => ({
  mapContext: getContext<ContextMap>(CONTEXT_MAP),
  layersContext: getContext<ContextLayers>(CONTEXT_LAYERS),
  selectedLayerContext: getContext<ContextSelectedLayer>(CONTEXT_SELECTED_LAYER)
});