<script lang="ts">
  import { addBasemapLayer, type AppBasemapLayer } from '../../lib/layers/basemap';
  import { AppMapLayerType, type AppMapLayer } from '../../lib/layers/default';
  import { getMapLayersContext } from '../../lib/contexts';
  import { getPrimaryToast } from '../../lib/toasts';
  import { modalNewBasemapLayer, modalNewObjectLayer } from '../modals';
  import { modalStore, type ModalSettings, toastStore } from '@skeletonlabs/skeleton';
  import { addObjectLayer, type AppObjectLayer } from '../../lib/layers/object';
  import Droppable from './reorder-dnd/Droppable.svelte';
  import Layer from './LayerListItem.svelte';

  const { mapContext, layersContext, selectedLayerContext } = getMapLayersContext();

  const addNewObjectLayer = (layer: AppObjectLayer) => {
    if (!layer) {
      return;
    }
    layersContext.update(layers => ({ ...layers, objects: addObjectLayer($mapContext, layers.objects, layer) }));
    selectedLayerContext.set(layer);
    toastStore.trigger(getPrimaryToast(`Layer "${layer.name}" has been added to map`));
  };

  const addNewBasemapLayer = (layer: AppBasemapLayer) => {
    if (!layer) {
      return;
    }
    layersContext.update(layers => ({ ...layers, basemaps: addBasemapLayer($mapContext, layers.basemaps, layer) }));
    selectedLayerContext.set(layer);
    toastStore.trigger(getPrimaryToast(`Basemap "${layer.name}" has been added to map`));
  };

  const newObjectLayerModal: ModalSettings = {
    type: 'component',
    component: modalNewObjectLayer,
    response: addNewObjectLayer
  };

  const newBasemapLayerModal: ModalSettings = {
    type: 'component',
    component: modalNewBasemapLayer,
    response: addNewBasemapLayer
  };

  let reorderDragging: AppMapLayerType|undefined = undefined;
  let reorderFocusedItem: AppMapLayer|undefined = undefined;
  const onDragStart = (event: DragEvent, layer: AppMapLayer) => {
    const card = (event.target as HTMLElement).parentElement.parentElement;
    event.dataTransfer.setDragImage(card, 0, 0);
    reorderDragging = layer.type;
    reorderFocusedItem = layer;
  };
  const onDrag = () => {};
  const onDragEnd = () => {
    reorderDragging = undefined;
    reorderFocusedItem = undefined;
  };
  const onDrop = newIndex => {
    layersContext.update(layers => {
      if (!$mapContext) {
        return layers;
      }
      const type = reorderFocusedItem.type;
      let arr: AppMapLayer[] = [];
      if (type === AppMapLayerType.BasemapLayer) {
        arr = layers.basemaps as AppMapLayer[];
      } else if (type === AppMapLayerType.FeatureLayer) {
        arr = layers.objects as AppMapLayer[];
      } else {
        return layers;
      }
      const currentIndex = arr.indexOf(reorderFocusedItem);
      if (currentIndex < 0) {
        return layers;
      }
      arr[currentIndex] = null;
      const newLayers = [
        ...arr.slice(0, newIndex),
        reorderFocusedItem,
        ...arr.slice(newIndex)
      ].filter(x => x) as AppMapLayer[];
      if (type === AppMapLayerType.BasemapLayer) {
        return { ...layers, basemaps: newLayers as AppBasemapLayer[] };
      }
      if (type === AppMapLayerType.FeatureLayer) {
        return { ...layers, objects: newLayers as AppObjectLayer[] };
      }
      return layers;
    });
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
      <Droppable dragging={reorderDragging === AppMapLayerType.FeatureLayer} on:drop={() => onDrop(idx)} />
      <Layer {layer} dragFocused={reorderDragging && reorderFocusedItem === layer}
        on:dragstart={(e) => onDragStart(e, layer)} on:drag={onDrag} on:dragend={onDragEnd}
      />
    {/each}
    <Droppable dragging={reorderDragging === AppMapLayerType.FeatureLayer} on:drop={() => onDrop($layersContext.objects.length)} />
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
      <Droppable dragging={reorderDragging === AppMapLayerType.BasemapLayer} on:drop={() => onDrop(idx)} />
      <Layer {layer} dragFocused={reorderDragging && reorderFocusedItem === layer}
        on:dragstart={(e) => onDragStart(e, layer)} on:drag={onDrag} on:dragend={onDragEnd}
      />
    {/each}
    <Droppable dragging={reorderDragging === AppMapLayerType.BasemapLayer} on:drop={() => onDrop($layersContext.basemaps.length)} />
  </ul>
</div>
