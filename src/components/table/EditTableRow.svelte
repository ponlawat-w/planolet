<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TableColumn, TableDataSourceRow, TableRow } from '../../lib/table/types';
  import EditAttributeValue from './EditAttributeValue.svelte';

  export let columns: TableColumn[];
  export let row: TableDataSourceRow;

  let data: TableRow;

  const init = () => {
    data = [...row.data];
  };
  $: if (row) init();

  const dispatch = createEventDispatcher<{
    submit: TableDataSourceRow,
    cancel: undefined
  }>();

  const keyup = (e: KeyboardEvent) => {
    if (e.key === 'Escape') return dispatch('cancel');
  };
</script>

<form id="editFeatureAttributesForm"
  on:submit|preventDefault={() => dispatch('submit', { id: row.id, data })}></form>
<tr>
  <td class="!p-2 !whitespace-nowrap">
    <button type="submit" form="editFeatureAttributesForm">
      <i class="fa fa-check text-xs"></i>
    </button>
    <button type="button" on:click={() => dispatch('cancel')}>
      <i class="fa fa-times text-xs"></i>
    </button>
  </td>
  {#each data as _, idx}
    <td class="!p-0 text-center">
      <EditAttributeValue column={columns[idx]} bind:value={data[idx]} generalClass="input" inputClass="p-2 text-sm" on:keyup={keyup} />
    </td>
  {/each}
</tr>
