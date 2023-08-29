<script lang="ts">
  import { modalStore, toastStore } from '@skeletonlabs/skeleton';
  import type { ModalParent } from '../../types';
  import { LayerType, tileLayerUrlValid, type MapLayer, createTileLayer } from '../../lib/layers';
  import { getErrorToast } from '../../lib/toasts';
  import { TileLayer } from 'leaflet';

  export let parent: ModalParent;

  let name: string = '';
  let url: string = '';
  let type: LayerType = LayerType.FeatureLayer;

  let valid: boolean = false;
  $: valid = (
      (type === LayerType.TileLayer && tileLayerUrlValid(url))
    ) ? true : false;
  
  const checkLayerType = () => {
    if (tileLayerUrlValid(url)) {
      type = LayerType.TileLayer;
      return;
    }
    type = LayerType.FeatureLayer;
  };

  const submit = () => {
    if (!valid) {
      return;
    }
    try {
      name = name === '' ? 'Untitled' : name;
      let layer: MapLayer = undefined;
      if (type === LayerType.TileLayer) {
        layer = createTileLayer(name, url);
      }
      if ($modalStore[0].response && layer) {
        $modalStore[0].response(layer);
      }
      modalStore.close();
    } catch {
      toastStore.trigger(getErrorToast(`Cannot add layer "${name}"`));
    }
  };
</script>

<div class="card w-modal">
  <form on:submit|preventDefault={submit}>
    <header class="card-header">
      <i class="fa-solid fa-plus-circle"></i>
      Add a new layer
      <button type="button" class="btn btn-sm float-right" on:click={modalStore.close}>
        <i class="fa fa-times"></i>
      </button>
    </header>
    <section class="p-4">
      {#if !parent}<slot />{/if}
      <div class="input-group mb-2">
        <div class="input-group-shim">Layer Name</div>
        <input type="text" class="input" placeholder="Untitled" bind:value={name}>
      </div>
      <div class="input-group mb-2">
        <div class="input-group-shim">URL</div>
        <input class="input font-mono" type="text" placeholder="https://" on:keyup={checkLayerType} bind:value={url} />
      </div>
      <div class="input-group mb-2">
        <div class="input-group-shim">Layer Type</div>
        <select class="input" bind:value={type}>
          <option value={LayerType.TileLayer}>Tile Layer</option>
          <option value={LayerType.FeatureLayer}>Feature Layer</option>
        </select>
      </div>
    </section>
    <footer class="card-footer text-right">
      <button type="submit" class="btn variant-filled-success" disabled={!valid}>Add</button>
    </footer>
  </form>
</div>
