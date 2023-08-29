<script lang="ts">
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import { getMapLayersContext } from '../../lib/contexts';
  import { LayerType, askToRemoveLayer, toggleLayerVisibility } from '../../lib/layers';

  const { mapContext, layersContext, selectedLayerContext } = getMapLayersContext();

  let editingName = false;
  let newName: string;
  const applyName = () => {
    if (!newName.trim()) {
      editingName = false;
      return;
    }
    $selectedLayerContext.name = newName;
    selectedLayerContext.set($selectedLayerContext);
    layersContext.update(layers => layers);
    editingName = false;
  };

  let visible: boolean;
  $: if ($selectedLayerContext && $layersContext) {
    visible = $selectedLayerContext.visible;
  }
</script>

{#if $selectedLayerContext}
  <div class="p-2">
    <a href={'javascript:void(0);'} class="float-right" on:click={() => selectedLayerContext.set(undefined)}><i class="fa fa-times"></i></a>
    <div class="text-center mb-2">
      {#if editingName}
        <form class="input-group grid-cols-[1fr_auto_auto]" on:submit|preventDefault={applyName}>
          <input type="text" class="input" bind:value={newName}>
          <button type="button" class="variant-filled-error" on:click={() => { editingName = false; }}><i class="fa fa-times"></i></button>
          <button type="submit" class="variant-filled-primary"><i class="fa fa-check"></i></button>
        </form>
      {:else}
        <h1 class="text-xl">
          {$selectedLayerContext.name}
          <small>
            <a href={'javascript:void(0);'} class="text-xs"
              on:click={() => { editingName = true; newName = $selectedLayerContext.name; }}>
              <i class="fa fa-pencil"></i>
            </a>
          </small>
        </h1>
      {/if}
      <span class="text-sm">
        {#if $selectedLayerContext.type === LayerType.TileLayer}Tile Layer (Raster){/if}
      </span>
    </div>
    <hr class="mb-2">
    <div class="mb-2">
      <SlideToggle name="visible" active="bg-primary-500" size="sm" bind:checked={visible} on:change={() => toggleLayerVisibility($selectedLayerContext, $mapContext, layersContext)}>
        Visible
      </SlideToggle>
    </div>
    <hr class="mb-2">
    {#if $selectedLayerContext.type === LayerType.TileLayer}
      <textarea class="textarea font-mono text-xs mb-2" style="cursor: default !important;"
        value={$selectedLayerContext.options.tileLayer?.url ?? ''} readonly></textarea>
    {/if}
    <button class="btn btn-sm w-full variant-filled-error" on:click={() => askToRemoveLayer($selectedLayerContext, $mapContext, layersContext, selectedLayerContext)}>
      <i class="fa fa-trash mr-2"></i>
      Remove
    </button>
  </div>
{/if}
