<script lang="ts">
  import { AppBasemapLayer } from '../../lib/layers/basemap';
  import { AppObjectLayer } from '../../lib/layers/object';
  import { getMapLayersContext } from '../../lib/contexts';
  import { getPrimaryToast } from '../../lib/toasts';
  import { modalNewBasemapLayer, modalNewObjectLayer } from '../modals';
  import { modalStore, type ModalSettings, toastStore } from '@skeletonlabs/skeleton';
  import Droppable from './reorder-dnd/Droppable.svelte';
  import Layer from './LayerListItem.svelte';
  import type { AppMapLayer } from '../../lib/layers/map-layer';

  const { layersContext, selectedLayerContext } = getMapLayersContext();

  const addNewLayer = (layer: AppMapLayer) => {
    if (!layer) {
      return;
    }
    $layersContext.addLayer(layer);
    selectedLayerContext.set(layer);
    if (layer instanceof AppBasemapLayer) {
      toastStore.trigger(getPrimaryToast(`Basemap "${layer.name}" has been added to map`));
    } else {
      toastStore.trigger(getPrimaryToast(`Layer "${layer.name}" has been added to map`));
    }
  };

  const newObjectLayerModal: ModalSettings = {
    type: 'component',
    component: modalNewObjectLayer,
    response: addNewLayer
  };

  const newBasemapLayerModal: ModalSettings = {
    type: 'component',
    component: modalNewBasemapLayer,
    response: addNewLayer
  };

  let reorderDragging: (typeof AppBasemapLayer)|(typeof AppObjectLayer)|undefined = undefined;
  let reorderFocusedItem: AppMapLayer|undefined = undefined;
  const onDragStart = (event: DragEvent, layer: AppMapLayer) => {
    const card = (event.target as HTMLElement).parentElement.parentElement;
    event.dataTransfer.setDragImage(card, 0, 0);
    if (layer instanceof AppBasemapLayer) {
      reorderDragging = AppBasemapLayer;
    } else if (layer instanceof AppObjectLayer) {
      reorderDragging = AppObjectLayer;
    }
    reorderFocusedItem = layer;
  };
  const onDrag = () => {};
  const onDragEnd = () => {
    reorderDragging = undefined;
    reorderFocusedItem = undefined;
  };
  const onDrop = (newIndex: number) => {
    $layersContext.reorderLayer(reorderFocusedItem, newIndex);
  };
</script>

<div class="p-2">
  <h1 class="text-lg whitespace-nowrap">
    Layers
    <div class="float-right">
      <button class="btn btn-sm variant-filled-primary" on:click={() => modalStore.trigger(newObjectLayerModal)}>
        <i class="fa fa-plus"></i>
      </button>
    </div>
  </h1>
  <ul class="list">
    {#each $layersContext.objects as layer, idx}
      <Droppable dragging={reorderDragging === AppObjectLayer} on:drop={() => onDrop(idx)} />
      <Layer {layer} dragFocused={reorderDragging && reorderFocusedItem === layer}
        on:dragstart={(e) => onDragStart(e, layer)} on:drag={onDrag} on:dragend={onDragEnd}
      />
    {/each}
    <Droppable dragging={reorderDragging === AppObjectLayer} on:drop={() => onDrop($layersContext.objects.length)} />
  </ul>
  <hr class="my-2">
  <h1 class="text-lg whitespace-nowrap">
    Basemaps
    <div class="float-right">
      <button class="btn btn-sm variant-filled-primary" on:click={() => modalStore.trigger(newBasemapLayerModal)}>
        <i class="fa fa-plus"></i>
      </button>
    </div>
  </h1>
  <ul class="list">
    {#each $layersContext.basemaps as layer, idx}
      <Droppable dragging={reorderDragging === AppBasemapLayer} on:drop={() => onDrop(idx)} />
      <Layer {layer} dragFocused={reorderDragging && reorderFocusedItem === layer}
        on:dragstart={(e) => onDragStart(e, layer)} on:drag={onDrag} on:dragend={onDragEnd}
      />
    {/each}
    <Droppable dragging={reorderDragging === AppBasemapLayer} on:drop={() => onDrop($layersContext.basemaps.length)} />
  </ul>
</div>
