<script lang="ts">
  import { AppMapLayerType } from '../../lib/layers/default';
  import { getMapLayersContext } from '../../lib/contexts';
  import { Table, tableMapperValues, type TableSource } from '@skeletonlabs/skeleton';
  import { getAttributedFeatures, type AppFeatureLayer, getAttributeHeaders, getFeatureAttributeData } from '../../lib/layers/feature';

  const { selectedLayerContext } = getMapLayersContext();

  let tableSource: TableSource = undefined;
  const refreshTableSource = () => {
    if (!$selectedLayerContext || $selectedLayerContext.type !== AppMapLayerType.FeatureLayer) {
      tableSource = undefined;
      return;
    }
    const selectedFeatureLayer: AppFeatureLayer = $selectedLayerContext as AppFeatureLayer;
    const features = getAttributedFeatures(selectedFeatureLayer.options.data);
    if (features.length) {
      const headers = getAttributeHeaders(features);
      tableSource = {
        head: headers,
        body: tableMapperValues(getFeatureAttributeData(features), headers)
      };
    } else {
      tableSource = undefined;
    }
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
