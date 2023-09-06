import { getContext } from 'svelte';
import type { AppLayers } from './layers/layers';
import type { AppMapLayer } from './layers/layer';
import type { Map } from 'leaflet';
import type { Writable } from 'svelte/store';

export const CONTEXT_MAP = 'map';
export const CONTEXT_LAYERS = 'layers';
export const CONTEXT_SELECTED_LAYER = 'selectedLayer';

export type ContextMap = Writable<Map>;
export type ContextLayers = Writable<AppLayers>;
export type ContextSelectedLayer = Writable<AppMapLayer|undefined>;

export const getMapLayersContext = () => ({
  mapContext: getContext<ContextMap>(CONTEXT_MAP),
  layersContext: getContext<ContextLayers>(CONTEXT_LAYERS),
  selectedLayerContext: getContext<ContextSelectedLayer>(CONTEXT_SELECTED_LAYER)
});
