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
    const attributesTable = $selectedLayerContext.getAttributeTables();
    tableSource = {
      head: attributesTable.headers,
      body: tableMapperValues(attributesTable.body, attributesTable.headers)
    };
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
{/if}

<style>
</style>
