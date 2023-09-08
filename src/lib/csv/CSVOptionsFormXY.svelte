<script lang="ts">
  export let xColumn: string = 'longitude';
  export let yColumn: string = 'latitude';
</script>

<div class="grid grid-cols-12">
  <div class="col-span-6">
    <div class="input-group">
      <div class="input-group-shim">X Column Name <small>(Longitude)</small></div>
      <input type="text" class="input" bind:value={xColumn}>
    </div>
  </div>
  <div class="col-span-6">
    <div class="input-group">
      <div class="input-group-shim">Y Column Name <small>(Latitude)</small></div>
      <input type="text" class="input" bind:value={yColumn}>
    </div>
  </div>
</div>
