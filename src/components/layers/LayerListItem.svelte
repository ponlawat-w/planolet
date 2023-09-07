<script lang="ts">
  import { getMapLayersContext } from '../../lib/contexts';
  import type { AppMapLayer } from '../../lib/layers/map-layer';

  export let layer: AppMapLayer;
  export let dragFocused: boolean = false;

  const { layersContext, selectedLayerContext } = getMapLayersContext();
  let selected: boolean = false;
  $: selected = $selectedLayerContext === layer;

  const selectLayer = () => {
    if ($selectedLayerContext && $selectedLayerContext === layer) {
      return selectedLayerContext.set(undefined);
    }
    selectedLayerContext.set(layer);
  };
</script>

<li class="!m-0">
  <div class="card flex text-sm card-hover w-full"
    class:bg-primary-200={!dragFocused && !selected && layer.visible}
    class:bg-surface-200={!dragFocused && !selected && !layer.visible}
    class:bg-success-500={!dragFocused && selected}
    class:bg-surface-500={dragFocused}
    class:text-surface-500={dragFocused}
    class:text-white={selected || dragFocused}
  >
    <div class="flex-auto pt-1 pl-2 whitespace-nowrap overflow-x-hidden">
      <button type="button" class="cursor-grab text-surface-500 mr-1 text-sm"
        class:text-white={selected}
        class:text-surface-500={dragFocused}
        draggable="true" on:dragstart on:drag on:dragend>
        <i class="fa fa-bars"></i>
      </button>
      <button type="button" class="cursor-pointer text-primary-500 hover:drop-shadow-md hover:text-primary-700"
        class:text-surface-500={dragFocused}
        on:click={() => $layersContext.toggleLayerVisibility(layer)}>
        <i class="fa-circle" class:fa-solid={layer.visible} class:fa-regular={!layer.visible}></i>
      </button>
      <a href={'javascript:void(0);'} on:click={selectLayer} class="hover:underline" class:text-surface-500={dragFocused}>
        {layer.name}
      </a>
    </div>
    <div class="flex-none">
      <button type="button" class="btn btn-sm text-error-500 dark:text-error-400 pt-2 pr-2" class:text-surface-500={dragFocused}
        on:click={() => $layersContext.askToRemoveLayer(layer, selectedLayerContext)}>
        <i class="fa fa-times"></i>
      </button>
    </div>
  </div>
</li>
