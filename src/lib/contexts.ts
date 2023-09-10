import { getContext } from 'svelte';
import type { AppLayers } from './layers/layers';
import type { AppMapLayer } from './layers/map-layer';
import type { Map } from 'leaflet';
import type { Writable } from 'svelte/store';

export const CONTEXT_MAP = 'map';
export const CONTEXT_LAYERS = 'layers';
export const CONTEXT_SELECTED_LAYER = 'selectedLayer';
export const CONTEXT_SELECTED_FEATURE_ID = 'selectedFeatureId';

export type ContextMap = Writable<Map>;
export type ContextLayers = Writable<AppLayers>;
export type ContextSelectedLayer = Writable<AppMapLayer|undefined>;
export type ContextSelectedFeatureId = Writable<string|undefined>;

export const getMapLayersContext = () => ({
  mapContext: getContext<ContextMap>(CONTEXT_MAP),
  layersContext: getContext<ContextLayers>(CONTEXT_LAYERS),
  selectedLayerContext: getContext<ContextSelectedLayer>(CONTEXT_SELECTED_LAYER),
  selectedFeatureIdContext: getContext<ContextSelectedFeatureId>(CONTEXT_SELECTED_FEATURE_ID)
});
