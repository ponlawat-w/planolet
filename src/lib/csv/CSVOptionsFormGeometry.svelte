<script lang="ts">
  import type { CSVGeometryBinaryEncoding, CSVGeometryMode } from './options';

  export let columnName: string = 'SHAPE';
  export let mode: CSVGeometryMode = 'wkt';
  export let encoding: CSVGeometryBinaryEncoding = 'hex';

  $: if (mode !== 'geojson' && mode !== 'wkt' && mode !== 'wkb') {
    mode = 'wkt';
  }
</script>

<div class="input-group grid-cols_[auto_1fr]">
  <div class="input-group-shim">Geometry Column Name</div>
  <input type="text" class="input" bind:value={columnName}>
</div>
<div class="input-group grid-cols_[auto_1fr]">
  <div class="input-group-shim">Geometry Format</div>
  <select class="input" bind:value={mode}>
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
