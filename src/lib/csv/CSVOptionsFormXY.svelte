<script lang="ts">
  import CSVColumnNameOption from './CSVColumnNameOption.svelte';

  export let xColumn: string;
  export let yColumn: string;
  export let columns: string[]|undefined = undefined;

  xColumn = xColumn ?? 'longitude';
  yColumn = yColumn ?? 'latitude';
</script>

<div class="grid grid-cols-12">
  <div class="col-span-6">
    <div class="input-group">
      <div class="input-group-shim">X Column Name <small>(Longitude)</small></div>
      <CSVColumnNameOption bind:value={xColumn} columns={columns} />
    </div>
  </div>
  <div class="col-span-6">
    <div class="input-group">
      <div class="input-group-shim">Y Column Name <small>(Latitude)</small></div>
      <CSVColumnNameOption bind:value={yColumn} columns={columns} />
    </div>
  </div>
</div>
