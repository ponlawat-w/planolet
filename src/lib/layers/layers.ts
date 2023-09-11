import { AppBasemapLayer } from './basemap';
import { AppObjectLayer } from './object';
import { getPrimaryToast } from '../toasts';
import { modalStore, toastStore } from '@skeletonlabs/skeleton';
import type { AppMapLayer } from './map-layer';
import type { ContextLayers, ContextSelectedLayer } from '../contexts';
import type { FeatureGroup, Map } from 'leaflet';
import { AppFeatureLayerBase } from './features/base';

export class AppLayers {
  private _map: Map = undefined;
  private _basemaps: AppBasemapLayer[] = [];
  private _objects: AppObjectLayer[] = [];
  private _context: ContextLayers;

  public get map() { return this._map; }
  public get basemaps() { return this._basemaps; }
  public get objects() { return this._objects; }
  public get context() { return this._context; }

  public constructor() {}

  public setContext(context: ContextLayers) {
    this._context = context;
  }

  private updateContext() {
    if (this._context) this._context.set(this);
  }

  public setMap(map: Map) {
    this._map = map;
  }

  public removeLayer(layer: AppMapLayer) {
    if (!this._map) {
      return;
    }
    if (layer.leaflet && this._map.hasLayer(layer.leaflet)) {
      this._map.removeLayer(layer.leaflet);
    }

    let reference: AppMapLayer[] = undefined;
    if (layer instanceof AppBasemapLayer) {
      reference = this._basemaps;
      const pane = this._map.getPane(layer.pane);
      if (pane) pane.remove();
    } else if (layer instanceof AppObjectLayer) {
      reference = this._objects;
    }

    if (!reference) {
      return;
    }

    const index = reference.indexOf(layer);
    if (index > -1) {
      reference.splice(index, 1);
      this.updateContext();
    }
  }

  public reorderLayer(layer: AppMapLayer, newIndex: number) {
    if (!this._map || !layer) {
      return;
    }
    let reference: AppMapLayer[] = [];
    if (layer instanceof AppBasemapLayer) {
      reference = this._basemaps;
    } else if (layer instanceof AppObjectLayer) {
      reference = this._objects;
    } else {
      return;
    }
    const currentIndex = reference.indexOf(layer);
    if (currentIndex < 0) {
      return;
    }
    reference[currentIndex] = null;
    const newLayers = [
      ...reference.slice(0, newIndex),
      layer,
      ...reference.slice(newIndex)
    ].filter(x => x) as AppMapLayer[];
    if (layer instanceof AppBasemapLayer) {
      this._basemaps = newLayers as AppBasemapLayer[];
    }
    if (layer instanceof AppObjectLayer) {
      this._objects = newLayers as AppObjectLayer[];
    }
    this.updateContext();
  }

  public hideLayer(layer: AppMapLayer) {
    if (!this._map || !this._map.hasLayer(layer.leaflet)) {
      return;
    }
    this._map.removeLayer(layer.leaflet);
    this.updateContext();
  }
  
  public showLayer(layer: AppMapLayer) {
    if (!this._map || this._map.hasLayer(layer.leaflet)) {
      return;
    }
    this._map.addLayer(layer.leaflet);
    this.updateContext();
  }

  public toggleLayerVisibility(layer: AppMapLayer) {
    this.updateContext();
    if (layer.visible) {
      layer.visible = false;
      this.hideLayer(layer);
      return;
    }
    layer.visible = true;
    this.showLayer(layer);
  }

  public reorderLeafletDisplay() {
    let i = 0;
    for (const layer of this._basemaps) if (layer.leaflet && this._map.hasLayer(layer.leaflet)) {
      const pane = this._map.getPane(layer.pane);
      if (!pane) {
        continue;
      }
      const zIndex = 200 + this._basemaps.length - i++;
      pane.style.zIndex = zIndex.toString();
    }
    for (const layer of this._objects) if (layer.leaflet && this._map.hasLayer(layer.leaflet)) {
      (layer.leaflet as FeatureGroup).bringToBack();
    }
  }

  public addLayer(newLayer: AppMapLayer) {
    if (!this._map || !newLayer.leaflet || this._map.hasLayer(newLayer.leaflet)) {
      return;
    }
    if (newLayer instanceof AppBasemapLayer) {
      this._map.createPane(newLayer.pane);
      newLayer.leaflet.options.pane = newLayer.pane;
      this._map.addLayer(newLayer.leaflet);
      this._basemaps = [newLayer, ...this._basemaps];
    } else if (newLayer instanceof AppObjectLayer) {
      this._map.addLayer(newLayer.leaflet);
      this._objects = [newLayer, ...this._objects];
      this.map.fitBounds((newLayer.leaflet as FeatureGroup).getBounds());
    }
    this.updateContext();
  }

  public rerenderLayer(layer: AppMapLayer, selectedFeatureId?: string) {
    if (!(layer instanceof AppFeatureLayerBase)) return;
    this.hideLayer(layer);
    layer.rerender();
    layer.setFeatureSelectedStyle(selectedFeatureId);
    this.showLayer(layer);
  }

  public askToRemoveLayer(
    layer: AppMapLayer,
    selectedLayerContext: ContextSelectedLayer
  ) {
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
        this.removeLayer(layer);
        toastStore.trigger(getPrimaryToast(`Layer "${layer.name}" has been removed from map`));
      }
    });
  }
};
