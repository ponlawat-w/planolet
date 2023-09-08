<script lang="ts">
  import CsvOptionsForm from '../../csv/CSVOptionsForm.svelte';
  import FormModal from '../../modals/FormModal.svelte';
  import type { CSVOptions } from '../../csv/options';
    import { modalStore } from '@skeletonlabs/skeleton';

  export let parent: any;
  
  let options: CSVOptions;

  const submit = () => {
    if ($modalStore[0] && $modalStore[0].response) {
      $modalStore[0].response({ submit: true, options });
    }
  };
</script>

<FormModal title="CSV Download Options" on:submit={submit} submitText="Download" submitIconClass="fa fa-download mr-2">
  {#if !parent}<slot />{/if}
  <CsvOptionsForm bind:options={options} />
</FormModal>
