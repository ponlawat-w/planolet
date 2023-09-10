<script lang="ts">
  import { getMapLayersContext } from '../../lib/contexts';
  import { AppFeatureLayerBase } from '../../lib/layers/features/base';

  const { selectedLayerContext, selectedFeatureIdContext } = getMapLayersContext();

  let layer: AppFeatureLayerBase;
  let featureAttributes: Record<string, any> = undefined;
  let keys: string[] = [];
  let touched: boolean = false;

  const changed = () => {
    layer = $selectedLayerContext instanceof AppFeatureLayerBase ? $selectedLayerContext : undefined;
    featureAttributes = {...layer?.getRecordFromId($selectedFeatureIdContext)} ?? undefined;
    keys = featureAttributes ? Object.keys(featureAttributes).filter(x => x !== layer.idField) : [];
    touched = false;
  };

  const submitEditProperties = () => {
    if (!layer) return;
    const obj = {};
    for (const key of keys) {
      obj[key] = featureAttributes[key];
    }
    layer.updateAttributes($selectedFeatureIdContext, obj);
    selectedLayerContext.set(layer);
  };

  $: if ($selectedLayerContext || $selectedFeatureIdContext) {
    changed();
  }
</script>

<div class="px-3 py-2">
  <hr class="mb-2">
  {#if featureAttributes}
    <div class="mb-2">
      <h3>Feature Attributes</h3>
      <form on:submit|preventDefault={submitEditProperties}>
        <table class="table">
          <tbody>
            <tr>
              <th class="!p-1 w-1/4 !whitespace-nowrap overflow-x-auto text-left">Feature ID</th>
              <td class="!p-1 w-3/4">
                <input type="text" class="input p-0 font-mono" value={featureAttributes[layer.idField]} readonly>
              </td>
            </tr>
            {#each keys as key}
            <tr>
              <th class="!p-1 !whitespace-nowrap overflow-x-auto text-left">{key}</th>
              <td class="!p-1">
                <input type="text" class="input p-0" on:keypress={() => { touched = true; }} bind:value={featureAttributes[key]}>
              </td>
            </tr>
            {/each}
            {#if touched}
            <tr>
              <th class="!p-1"></th>
              <td class="!p-1">
                <div class="grid grid-cols-2">
                  <button type="submit" class="btn text-xs p-2 variant-filled-primary">
                    <i class="fa fa-save mr-2"></i>
                    Save
                  </button>
                  <button type="button" class="btn text-xs p-2 variant-filled-surface">
                    <i class="fa fa-times mr-2"></i>
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
            {/if}
          </tbody>
        </table>
      </form>
    </div>
  {/if}
  <button type="button" class="btn btn-sm w-full variant-filled-success mb-2">
    <i class="fa fa-pencil mr-2"></i>
    Edit Feature Geometry
  </button>
  <button type="button" class="btn btn-sm w-full variant-filled-secondary" on:click={() => selectedFeatureIdContext.set(undefined)}>
    <i class="fa-regular fa-circle-xmark mr-2"></i>
    Deselect Feature
  </button>
</div>
