<script lang="ts">
  import { AppBasemapLayer } from '../../lib/layers/basemap';
  import { getExceptionErrorToast } from '../../lib/toasts';
  import { modalStore, toastStore } from '@skeletonlabs/skeleton';
  import type { ModalParent } from '../../types';

  export let parent: ModalParent;

  let name: string = '';
  let url: string = '';

  let valid: boolean = false;
  $: valid = AppBasemapLayer.urlValid(url);
  
  const submit = () => {
    if (!valid) {
      return;
    }
    try {
      name = name.trim() === '' ? 'Untitled' : name;
      const layer: AppBasemapLayer = new AppBasemapLayer(name, url);
      if ($modalStore[0].response && layer) {
        $modalStore[0].response(layer);
      }
      modalStore.close();
    } catch (ex: Error|any) {
      toastStore.trigger(getExceptionErrorToast(`Cannot add basemap layer "${name}"`, ex));
    }
  };
</script>

<div class="card w-modal">
  <form on:submit|preventDefault={submit}>
    <header class="card-header">
      <i class="fa-solid fa-plus-circle"></i>
      Add a new basemap layer
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
        <input class="input font-mono" type="text" placeholder="https://" bind:value={url} />
      </div>
    </section>
    <footer class="card-footer text-right">
      <button type="submit" class="btn variant-filled-success" disabled={!valid}>Add</button>
    </footer>
  </form>
</div>
