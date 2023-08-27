<script lang="ts">
  import {
    map as initialiseMap,
    type Layer,
    type Map as LeafletMap
  } from 'leaflet';
  import { onMount } from 'svelte';

  export let layers: Layer[] = [];

  let map: LeafletMap;
  
  onMount(() => {
    map = initialiseMap('map');
    map.setView([18.78911, 98.98514], 13);
    for (const layer of layers) {
      map.addLayer(layer);
    }
  });
</script>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>

<div id="map"></div>

<style>
  #map {
    width: 100%;
    height: 90vh;
  }
</style>
