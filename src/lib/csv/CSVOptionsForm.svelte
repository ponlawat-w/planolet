<script lang="ts">
  import type { AppFeatureLayerBase } from '../layers/features/base';
  import { SpatialCSVWriter } from '../layers/writer/csv';
  import CsvOptionsFormGeometry from './CSVOptionsFormGeometry.svelte';
  import CsvOptionsFormXY from './CSVOptionsFormXY.svelte';
  import {
    getDefaultCSVOptions,
    type CSVOptions,
    type CSVGeometryXYOptions,
    type CSVGeomtryBinaryOptions,
    type CSVGeneralOptions,
    type CSVGeometryMode,
    type CSVGeometryBinaryEncoding
  } from './options';

  export let options: CSVOptions = getDefaultCSVOptions();
  export let layer: AppFeatureLayerBase|undefined = undefined;

  let { delimiter } = options;
  let { xColumn, yColumn } = options.geometry as CSVGeometryXYOptions;
  let { columnName, encoding } = options.geometry as CSVGeomtryBinaryOptions;
  let mode: CSVGeometryMode = options.geometry.mode;

  let layerIsXY: boolean;
  $: layerIsXY = !layer || SpatialCSVWriter.layerIsXYPoints(layer) ? true : false;

  enum GeometryType {
    None, XY, SingleColumn
  };
  let geometryType = GeometryType.SingleColumn;

  const updateOptions = (params: {
    geometryType: GeometryType,
    delimiter: string,
    mode: CSVGeometryMode,
    xColumn: string,
    yColumn: string,
    columnName: string,
    encoding: CSVGeometryBinaryEncoding
  }): CSVOptions => {
    const generalOptions: CSVGeneralOptions = { delimiter: params.delimiter };
    if (geometryType === GeometryType.None) {
      return { ...generalOptions, geometry: { mode: 'none' } };
    }
    if (geometryType === GeometryType.XY) {
      return { ...generalOptions, geometry: { mode: 'xy', xColumn: params.xColumn, yColumn: params.yColumn } };
    }
    if (geometryType === GeometryType.SingleColumn) {
      return {
        ...generalOptions,
        geometry: {
          mode: params.mode as any,
          columnName: params.columnName,
          encoding: params.mode === 'wkb' ? params.encoding as any : undefined
        }
      };
    }
    return { ...generalOptions, geometry: { mode: 'none' } };
  };

  $: options = updateOptions({ geometryType, delimiter, mode, xColumn, yColumn, columnName, encoding });
</script>

<div class="input-group grid-cols-[auto_auto] w-1/2 mb-2">
  <div class="input-group-shim">Delimiter</div>
  <input type="text" class="input" bind:value={delimiter}>
</div>
<div class="mb-2">
  Geometry:
  <label class="inline mr-2">
    <input type="radio" bind:group={geometryType} value={GeometryType.None}>
    None
  </label>
  {#if layerIsXY}
    <label class="inline mr-2">
      <input type="radio" bind:group={geometryType} value={GeometryType.XY}>
      X Y Columns
    </label>
  {/if}
  <label class="inline mr-2">
    <input type="radio" bind:group={geometryType} value={GeometryType.SingleColumn}>
    Geometry Column
  </label>
</div>
<div class="mb-2">
  {#if geometryType === GeometryType.XY}
    <CsvOptionsFormXY bind:xColumn={xColumn} bind:yColumn={yColumn} />
  {:else if geometryType === GeometryType.SingleColumn}
    <CsvOptionsFormGeometry bind:mode={mode} bind:columnName={columnName} bind:encoding={encoding} />
  {/if}
</div>
