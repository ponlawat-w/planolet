<script lang="ts">
  import { AppFeatureLayerBase } from '../../lib/layers/features/base';
  import { getMapLayersContext } from '../../lib/contexts';
  import { Table, tableMapperValues, type TableSource } from '@skeletonlabs/skeleton';

  const { selectedLayerContext } = getMapLayersContext();

  let tableSource: TableSource = undefined;
  const refreshTableSource = () => {
    if (!$selectedLayerContext || !($selectedLayerContext instanceof AppFeatureLayerBase)) {
      tableSource = undefined;
      return;
    }
    const attributesTable = $selectedLayerContext.getAttributesTable();
    tableSource = attributesTable.headers.length ? attributesTable.toTableSource() : undefined;
  };

  $: if ($selectedLayerContext) {
    refreshTableSource();
  }
</script>

{#if tableSource}
  <div class="max-h-48 overflow-y-auto" class:regionBody={false}>
    <Table source={tableSource} interactive={true}
      regionCell="!p-1" regionHeadCell="!p-2" />
  </div>
{:else}
  <div class="text-center">
    This layer does not have attributes table.
  </div>
{/if}

<style>
</style>
