<script lang="ts">
  import Layer from './LayerListItem.svelte';
  import { addLayer, reorderLayer, type MapLayer } from '../../lib/layers';
  import { modalStore, type ModalSettings, toastStore } from '@skeletonlabs/skeleton';
  import { modalNewLayer } from '../modals';
  import { getMapLayersContext } from '../../lib/contexts';
  import { getPrimaryToast } from '../../lib/toasts';
  import Droppable from './reorder-dnd/Droppable.svelte';

  const { mapContext, layersContext, selectedLayerContext } = getMapLayersContext();

  const addNewLayer = (layer: MapLayer) => {
    if (!layer) {
      return;
    }
    layersContext.update(layers => addLayer($mapContext, layers, layer));
    selectedLayerContext.set(layer);
    toastStore.trigger(getPrimaryToast(`Layer "${layer.name}" has been added to map`));
  };

  const newLayerModal: ModalSettings = {
    type: 'component',
    component: modalNewLayer,
    response: addNewLayer
  };

  let reorderDragging: boolean = false;
  let reorderFocusedItem: MapLayer|undefined = undefined;
  const onDragStart = (event: DragEvent, layer: MapLayer) => {
    const card = (event.target as HTMLElement).parentElement.parentElement;
    event.dataTransfer.setDragImage(card, 0, 0);
    reorderDragging = true;
    reorderFocusedItem = layer;
  };
  const onDrag = () => {};
  const onDragEnd = () => {
    reorderDragging = false;
    reorderFocusedItem = undefined;
  };
  const onDrop = newIndex => {
    layersContext.update(layers => {
      if (!$mapContext) {
        return layers;
      }
      const currentIndex = layers.indexOf(reorderFocusedItem);
      if (currentIndex < 0) {
        return layers;
      }
      layers[currentIndex] = null;
      const newLayers = [
        ...layers.slice(0, newIndex),
        reorderFocusedItem,
        ...layers.slice(newIndex)
      ].filter(x => x) as MapLayer[];
      reorderLayer($mapContext, newLayers);
      return newLayers;
    });
  };
</script>

<div class="p-2">
  <h1 class="mb-4 text-lg whitespace-nowrap">
    Layers
    <div class="float-right">
      <button class="btn btn-sm variant-filled-primary" on:click={() => modalStore.trigger(newLayerModal)}>
        <i class="fa fa-plus"></i>
      </button>
    </div>
  </h1>
  <ul class="list">
    {#each $layersContext as layer, idx}
      <Droppable dragging={reorderDragging} on:drop={() => onDrop(idx)} />
      <Layer {layer} dragFocused={reorderDragging && reorderFocusedItem === layer}
        on:dragstart={(e) => onDragStart(e, layer)} on:drag={onDrag} on:dragend={onDragEnd}
      />
    {/each}
    <Droppable dragging={reorderDragging} on:drop={() => onDrop($layersContext.length)} />
  </ul>
</div>
