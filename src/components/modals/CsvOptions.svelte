<script lang="ts">
  import { beforeUpdate, onMount } from 'svelte';
  import { DataTable } from '../../lib/table';
  import type { CSVGeospaitaliseOptions } from '../../lib/layers/features/csv';

  export let options: CSVGeospaitaliseOptions;
  export let content: string;

  enum GeometryType {
    None = 1, XY = 2, SingleColumn = 3
  };

  let preview: DataTable;
  const generatePreviewData = () => {
    preview = DataTable.createFromCsv(content.split('\n').slice(0, 3).join('\n'), options.delimiter);
  };
  generatePreviewData();

  const assumeGeometryType = () => {
    const geomColumns = preview.headers.filter(column => {
      const name = column.name.toLowerCase();
      return name.includes('geom') || name.includes('geojson') || name.includes('wkt') || name.includes('wkb') || name.includes('wkx')
    });
    if (geomColumns.length) {
      geometryType = GeometryType.SingleColumn;
      options.geometry = { geometryColumn: geomColumns[0].name };
      options = options;
      return;
    }
    const xColumns = preview.headers.filter(column => {
      const name = column.name.toLowerCase();
      return name === 'x' || name.includes('_x') || name.includes('-y') || name.includes('lon') || name.includes('lng');
    });
    const yColumns = preview.headers.filter(column => {
      const name = column.name.toLowerCase();
      return name === 'y' || name.includes('_y') || name.includes('-y') || name.includes('lat');
    });
    if (xColumns.length && yColumns.length) {
      geometryType = GeometryType.XY;
      options.geometry = { xColumn: xColumns[0].name, yColumn: yColumns[0].name };
      options = options;
      return;
    }
    geometryType = GeometryType.None;
    options.geometry = {};
    options = options;
    return;
  };

  let geometryType: GeometryType = GeometryType.None;
  let customGeometryType: boolean = false;
  $: if (geometryType && customGeometryType) {
    if (preview.headers.length) {
      if (geometryType === GeometryType.SingleColumn && !options.geometry.geometryColumn) {
        options.geometry = { geometryColumn: preview.headers[0].name };
      } else if (geometryType === GeometryType.XY && (!options.geometry.xColumn || !options.geometry.yColumn)) {
        options.geometry = { xColumn: preview.headers[0].name, yColumn: preview.headers[preview.headers.length > 0 ? 1 : 0].name };
      }
    } else {
      options.geometry = {};
    }
    options = options;
  }

  const init = () => {
    customGeometryType = false;
    generatePreviewData();
    assumeGeometryType();
  };
  let previousContent = content;
  beforeUpdate(() => {
    if (previousContent !== content) {
      init();
      previousContent = content;
    }
  });
  onMount(() => init());
</script>

<div class="card mt-2 py-2 px-4">
  <h3 class="mb-2">CSV Options</h3>
  <div class="input-group grid-cols-[auto_auto] w-1/2 mb-2">
    <div class="input-group-shim">Delimiter</div>
    <input type="text" class="input" bind:value={options.delimiter} on:change={() => { options = options; }}>
  </div>
  <div class="mb-2">
    Geometry:
    <label class="inline mr-2">
      <input type="radio" bind:group={geometryType} value={GeometryType.None} on:click={() => { customGeometryType = true; }}>
      None
    </label>
    <label class="inline mr-2">
      <input type="radio" bind:group={geometryType} value={GeometryType.XY} on:click={() => { customGeometryType = true; }}>
      X Y Columns
    </label>
    <label class="inline mr-2">
      <input type="radio" bind:group={geometryType} value={GeometryType.SingleColumn} on:click={() => { customGeometryType = true; }}>
      Geometry Column
    </label>
  </div>
  {#if geometryType === GeometryType.XY}
    <div class="grid grid-cols-12">
      <div class="col-span-6">
        <div class="input-group">
          <div class="input-group-shim">X Column</div>
          <select bind:value={options.geometry.xColumn}>
            {#each preview.headers as column}<option value={column.name}>{column.name}</option>{/each}
          </select>
        </div>
      </div>
      <div class="col-span-6">
        <div class="input-group">
          <div class="input-group-shim">Y Column</div>
          <select bind:value={options.geometry.yColumn}>
            {#each preview.headers as column}<option value={column.name}>{column.name}</option>{/each}
          </select>
        </div>
      </div>
    </div>
  {:else if geometryType === GeometryType.SingleColumn}
    <div class="input-group grid-cols_[auto_1fr]">
      <div class="input-group-shim">Geometry Column</div>
      <select bind:value={options.geometry.geometryColumn}>
        {#each preview.headers as column}<option value={column.name}>{column.name}</option>{/each}
      </select>
    </div>
  {/if}
</div>
