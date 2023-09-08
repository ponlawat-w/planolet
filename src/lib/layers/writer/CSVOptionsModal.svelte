<script lang="ts">
  import { getMapLayersContext } from '../../contexts';
  import { modalStore } from '@skeletonlabs/skeleton';
  import CsvOptionsForm from '../../csv/CSVOptionsForm.svelte';
  import FormModal from '../../modals/FormModal.svelte';
  import { AppFeatureLayerBase } from '../features/base';
  import { getDefaultCSVOptions, type CSVOptions } from '../../csv/options';

  export let parent: any;

  const { selectedLayerContext } = getMapLayersContext();
  let layer: AppFeatureLayerBase|undefined;
  $: layer = $selectedLayerContext instanceof AppFeatureLayerBase ? $selectedLayerContext : undefined;
  
  let options: CSVOptions = getDefaultCSVOptions();

  const submit = () => {
    if ($modalStore[0] && $modalStore[0].response) {
      $modalStore[0].response({ submit: true, options });
    }
  };
</script>

<FormModal title="CSV Download Options" on:submit={submit} submitText="Download" submitIconClass="fa fa-download mr-2">
  {#if !parent}<slot />{/if}
  <CsvOptionsForm layer={layer} bind:options={options} />
</FormModal>
