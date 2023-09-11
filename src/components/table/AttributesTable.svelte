<script lang="ts">
  import { AppFeatureLayerBase } from '../../lib/layers/features/base';
  import { getMapLayersContext } from '../../lib/contexts';
  import EditTableRow from './EditTableRow.svelte';
  import { toastStore } from '@skeletonlabs/skeleton';
  import { getSuccessToast } from '../../lib/toasts';
  import type { DataTable } from '../../lib/table/table';
  import type { TableDataSource, TableDataSourceRow } from '../../lib/table/types';

  const { mapContext, selectedLayerContext, selectedFeatureIdContext } = getMapLayersContext();

  let selectedLayer: AppFeatureLayerBase;
  let attributesTable: DataTable;
  let data: TableDataSource = undefined;
  let selectedId: string|undefined;
  let editingIndex: number = -1;

  $: selectedLayer = $selectedLayerContext instanceof AppFeatureLayerBase ? $selectedLayerContext : undefined;
  $: attributesTable = selectedLayer?.getAttributesTable() ?? undefined;
  $: data = attributesTable?.toTableDataSource() ?? undefined;
  $: selectedId = $selectedFeatureIdContext;
  $: if (selectedId || !selectedId) {
    editingIndex = -1;
  }

  const click = (id: string) => {
    if (!selectedLayer || !id) return;
    const previousId = selectedId;
    if (previousId === id) return selectedLayer.zoomTo(id, $mapContext);
    if (previousId) selectedLayer.setLayerSelectedStyle(previousId);
    selectedLayer.setFeatureSelectedStyle(id);
    selectedFeatureIdContext.set(id);
  };

  const mouseEnter = (id: string) => {
    if (!selectedLayer || !id) return;
    if (!id) return;
    if (id === selectedId) return;
    selectedLayer.setFeatureHoveredStyle(id);
  };

  const mouseLeave = (id: string) => {
    if (!selectedLayer || !id) return;
    if (!id) return;
    if (id === selectedId) {
      selectedLayer.setFeatureSelectedStyle(id);
    } else {
      selectedLayer.setLayerSelectedStyle(id);
    }
  };

  const editSubmit = (event: CustomEvent<TableDataSourceRow>) => {
    editingIndex = -1;
    const id = event.detail.id;
    const record: Record<string, any> = {};
    for (let i = 0; i < data.columns.length; i++) {
      record[data.columns[i].name] = event.detail.data[i];
    }
    selectedLayer.updateAttributes(id, record);
    selectedLayer = selectedLayer;
    selectedFeatureIdContext.set(undefined);
    selectedFeatureIdContext.set(id);
    toastStore.trigger(getSuccessToast('Feature properties updated'));
  };
</script>

{#if data && data.columns.length}
<div class="max-h-48 overflow-y-auto" class:regionBody={false}>
  <table class="table">
    <thead>
      <tr>
        <th></th>
        {#each data.columns as column}<th class="!p-2">{column}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each data.rows as row, idx}
        {#if editingIndex === idx}
          <EditTableRow columns={data.columns} row={row} on:submit={editSubmit} on:cancel={() => { editingIndex = -1; }} />
        {:else}
          <tr class:hover:!bg-tertiary-500={selectedId !== row.id}
            class:hover:dark:text-black={selectedId !== row.id}
            class:hover:!bg-secondary-400={selectedId === row.id}
            class:!bg-secondary-300={selectedId === row.id}
            class:dark:text-black={selectedId === row.id}
            on:click={() => click(row.id)}
            on:mouseenter={() => mouseEnter(row.id)}
            on:mouseleave={() => mouseLeave(row.id)}>
            <td class="!p-2">
              <button type="button" on:click|stopPropagation={() => { editingIndex = idx; }}>
                <i class="fa fa-pencil text-xs"></i>
              </button>
            </td>
            {#each row.data as cell}
              <td class="!p-2">
                {cell !== undefined && cell !== null ? cell : ''}
              </td>
            {/each}
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>
{:else}
  <div class="text-center">
    This layer does not have attributes table.
  </div>
{/if}

<style>
</style>
