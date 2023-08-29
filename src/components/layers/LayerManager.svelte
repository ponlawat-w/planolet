<script lang="ts" context="module">
    import type { Map } from 'leaflet';
    import { getMapLayersContext } from '../../lib/contexts';
    import { removeLayer, type MapLayer } from '../../lib/layers';
    import { modalStore, toastStore } from '@skeletonlabs/skeleton';
    import { getPrimaryToast } from '../../lib/toasts';

  export const askToRemoveLayer = (layer: MapLayer, map: Map) => {
    const { layersContext, selectedLayerContext } = getMapLayersContext();
    modalStore.trigger({
      type: 'confirm',
      title: '<i class="fa fa-exclamation-triangle"></i> Layer Delete Confirmation',
      body: `Do you want to remove "${layer.name}"?`,
      buttonTextConfirm: 'Yes',
      buttonTextCancel: 'No',
      response: (confirm: boolean) => {
        if (!confirm) {
          return;
        }
        layersContext.update(layers => removeLayer(map, layers, layer));
        toastStore.trigger(getPrimaryToast(`Layer "${layer.name}" has been removed from map`));
        selectedLayerContext.update(selectedLayer => selectedLayer === layer ? selectedLayer : undefined)
      }
    });
  };
</script>
