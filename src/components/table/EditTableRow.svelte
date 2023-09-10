<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TableDataSourceRow, TableRow } from '../../lib/table';

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
    <td class="!p-0">
      <input type="text" form="editFeatureAttributesForm" class="input p-2 text-sm" bind:value={data[idx]} on:keyup={keyup}>
    </td>
  {/each}
</tr>
