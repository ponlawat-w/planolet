<script lang="ts">
  import { AppFeatureLayerBase } from '../../lib/layers/features/base';
  import { getMapLayersContext } from '../../lib/contexts';
  import type { DataTable, TableDataSource } from '../../lib/table/table';
  import Table from '../../lib/table/Table.svelte';

  const { mapContext, selectedLayerContext, selectedFeatureIdContext } = getMapLayersContext();

  let selectedLayer: AppFeatureLayerBase;
  let attributesTable: DataTable;
  let tableData: TableDataSource = undefined;

  $: selectedLayer = $selectedLayerContext instanceof AppFeatureLayerBase ? $selectedLayerContext : undefined;
  $: attributesTable = selectedLayer?.getAttributesTable() ?? undefined;
  $: tableData = attributesTable?.toTableDataSource() ?? undefined;

  const click = (event: CustomEvent<string|undefined>) => {
    if (!selectedLayer || !event.detail) return;
    const id = event.detail;
    const previousId = $selectedFeatureIdContext;
    if (previousId === id) return selectedLayer.zoomTo(id, $mapContext);
    if (previousId) selectedLayer.setLayerSelectedStyle(previousId);
    selectedLayer.setFeatureSelectedStyle(id);
    selectedFeatureIdContext.set(id);
  };

  const mouseEnter = (event: CustomEvent<string|undefined>) => {
    if (!selectedLayer || !event.detail) return;
    if (!event.detail) return;
    if (event.detail === $selectedFeatureIdContext) return;
    selectedLayer.setFeatureHoveredStyle(event.detail);
  };

  const mouseLeave = (event: CustomEvent<string|undefined>) => {
    if (!selectedLayer || !event.detail) return;
    if (!event.detail) return;
    if (event.detail === $selectedFeatureIdContext) {
      selectedLayer.setFeatureSelectedStyle(event.detail);
    } else {
      selectedLayer.setLayerSelectedStyle(event.detail);
    }
  };
</script>

{#if tableData}
<div class="max-h-48 overflow-y-auto" class:regionBody={false}>
  <Table data={tableData} selectedId={$selectedFeatureIdContext}
    on:click={click} on:mouseenter={mouseEnter} on:mouseleave={mouseLeave} />
</div>
{/if}

<style>
</style>
