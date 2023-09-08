<script lang="ts">
  import CSVColumnNameOption from './CSVColumnNameOption.svelte';
  import type { CSVGeometryBinaryEncoding, CSVGeometryMode } from './options';

  export let columnName: string;
  export let mode: CSVGeometryMode;
  export let encoding: CSVGeometryBinaryEncoding;
  export let columns: string[]|undefined = undefined;

  columnName = columnName ?? 'SHAPE';

  $: if (mode !== 'geojson' && mode !== 'wkt' && mode !== 'wkb' && mode !== 'auto') {
    mode = 'wkt';
  }
</script>

<div class="input-group grid-cols_[auto_1fr]">
  <div class="input-group-shim">Geometry Column Name</div>
  <CSVColumnNameOption bind:value={columnName} columns={columns} />
</div>
<div class="input-group grid-cols_[auto_1fr]">
  <div class="input-group-shim">Geometry Format</div>
  <select class="input" bind:value={mode}>
    {#if columns && columns.length}<option value={"auto"}>Automatic Detection</option>{/if}
    <option value={"geojson"}>GeoJSON Geometry Text</option>
    <option value={"wkt"}>Well-Known Text (WKT)</option>
    <option value={"wkb"}>Well-Known Bytes (WKB)</option>
  </select>
</div>
{#if mode === 'wkb'}
  <div class="input-group grid-cols_[auto_1fr]">
    <div class="input-group-shim">Binary Encoding Mode</div>
    <select class="input" bind:value={encoding}>
      <option value={"hex"}>Hex (base16)</option>
      <option value={"base64"}>Base64</option>
    </select>
  </div>
{/if}
