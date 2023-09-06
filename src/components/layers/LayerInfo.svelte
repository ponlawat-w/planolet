<script lang="ts">
  import { AppBasemapLayer } from '../../lib/layers/basemap';
  import { AppFeatureLayerBase } from '../../lib/layers/features/base';
  import { AppObjectLayer } from '../../lib/layers/object';
  import { getMapLayersContext } from '../../lib/contexts';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import type { FeatureGroup } from 'leaflet';

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

  let featuresCount: number;
  $: if ($selectedLayerContext instanceof AppFeatureLayerBase) {
    featuresCount = $selectedLayerContext.getFeaturesCount();
  } else {
    featuresCount = undefined;
  }

  const zoomToLayer = () => {
    const layer: FeatureGroup = $selectedLayerContext.leaflet as FeatureGroup;
    if (!layer) {
      return;
    }
    $mapContext.fitBounds(layer.getBounds());
  };
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
      <div class="text-sm">
        {#if $selectedLayerContext instanceof AppBasemapLayer}
          Basemap Layer
        {:else if $selectedLayerContext instanceof AppFeatureLayerBase}
          <div>Feature Layer</div>
          <div class="text-xs">{$selectedLayerContext.getGeometryTypeText()}</div>
        {/if}
      </div>
    </div>
    <hr class="mb-2">
    <div class="mb-2">
      <SlideToggle name="visible" active="bg-primary-500" size="sm" bind:checked={visible} on:change={() => $layersContext.toggleLayerVisibility($selectedLayerContext)}>
        Visible
      </SlideToggle>
      {#if visible && $selectedLayerContext instanceof AppObjectLayer}
        <button class="btn btn-sm float-right variant-filled-primary" on:click={zoomToLayer}>
          <i class="fa-solid fa-arrows-to-circle"></i>
        </button>
      {/if}
    </div>
    <hr class="mb-2">
    {#if $selectedLayerContext instanceof AppBasemapLayer}
      <textarea class="textarea font-mono text-xs mb-2" style="cursor: default !important;"
        value={$selectedLayerContext.url} readonly></textarea>
      <hr class="mb-2">
    {:else if featuresCount !== undefined}
      <p class="pb-2">
        {featuresCount} feature{featuresCount === 1 ? '' : 's'} in this layer.
      </p>
      <hr class="mb-2">
    {/if}
    <button class="btn btn-sm w-full variant-filled-error" on:click={() => $layersContext.askToRemoveLayer($selectedLayerContext, selectedLayerContext)}>
      <i class="fa fa-trash mr-2"></i>
      Remove Layer
    </button>
  </div>
{/if}
