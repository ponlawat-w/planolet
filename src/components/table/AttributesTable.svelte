<script lang="ts">
  import { AppFeatureLayerBase } from '../../lib/layers/features/base';
  import { getMapLayersContext } from '../../lib/contexts';
  import { Table, type TableSource } from '@skeletonlabs/skeleton';

  const { mapContext, selectedLayerContext } = getMapLayersContext();

  let tableSource: TableSource = undefined;
  let selectedId: string;

  const refreshTableSource = () => {
    selectedId = undefined;
    if (!$selectedLayerContext || !($selectedLayerContext instanceof AppFeatureLayerBase)) {
      tableSource = undefined;
      return;
    }
    const attributesTable = $selectedLayerContext.getAttributesTable();
    tableSource = attributesTable.headers.length ? attributesTable.toTableSource() : undefined;
  };

  const onSelected = (event: CustomEvent<[string]>) => {
    if (!event.detail || !event.detail.length) return;
    if (!($selectedLayerContext instanceof AppFeatureLayerBase)) return;
    if (selectedId === event.detail[0]) return $selectedLayerContext.zoomTo(selectedId, $mapContext);
    if (selectedId) $selectedLayerContext.setSelectedStyle(selectedId);
    selectedId = event.detail[0];
    $selectedLayerContext.setHoverStyle(selectedId);
  };

  $: if ($selectedLayerContext) {
    refreshTableSource();
  }
</script>

{#if tableSource}
  <div class="max-h-48 overflow-y-auto" class:regionBody={false}>
    <Table source={tableSource} interactive={true} on:selected={onSelected}
      regionCell="!p-1" regionHeadCell="!p-2" />
  </div>
{:else}
  <div class="text-center">
    This layer does not have attributes table.
  </div>
{/if}

<style>
</style>
