import type { Map } from 'leaflet';
import type { Writable } from 'svelte/store';
import type { AppMapLayer } from './layers/default';
import { getContext } from 'svelte';
import type { AppBasemapLayer } from './layers/basemap';
import type { AppObjectLayer } from './layers/object';

export const CONTEXT_MAP = 'map';
export const CONTEXT_LAYERS = 'layers';
export const CONTEXT_SELECTED_LAYER = 'selectedLayer';

export type AppMapLayers = { basemaps: AppBasemapLayer[], objects: AppObjectLayer[] };

export type ContextMap = Writable<Map>;
export type ContextLayers = Writable<AppMapLayers>;
export type ContextSelectedLayer = Writable<AppMapLayer|undefined>;

export const getMapLayersContext = () => ({
  mapContext: getContext<ContextMap>(CONTEXT_MAP),
  layersContext: getContext<ContextLayers>(CONTEXT_LAYERS),
  selectedLayerContext: getContext<ContextSelectedLayer>(CONTEXT_SELECTED_LAYER)
});
