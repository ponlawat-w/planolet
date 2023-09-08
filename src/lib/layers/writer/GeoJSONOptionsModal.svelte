<script lang="ts">
  import { SlideToggle, modalStore } from '@skeletonlabs/skeleton';
  import FormModal from '../../modals/FormModal.svelte';
  import type { GeoJSONWriterOptions } from './geojson';

  export let parent: any;

  let pretty: boolean = false;
  let space: number = 2;
  const getOptions = (): GeoJSONWriterOptions => pretty ? { pretty, space } : { pretty };

  const submit = () => {
    if ($modalStore[0].response) {
      $modalStore[0].response({ submit: true, options: getOptions() });
    }
    modalStore.close();
  };
</script>

<FormModal title="GeoJSON Download Options" on:submit={submit} submitText="Download" submitIconClass="fa fa-download mr-2">
  {#if !parent}<slot />{/if}
  <SlideToggle name="pretty" size="sm" active="bg-primary-500" bind:checked={pretty}>
    Pretty GeoJSON <small>with spaces and indents</small>
  </SlideToggle>
  {#if pretty}
    <div class="input-group w-1/2">
      <div class="input-group-shim">Indent Size</div>
      <input type="number" bind:value={space} class="input">
    </div>
  {/if}
</FormModal>
