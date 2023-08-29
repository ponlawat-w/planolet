<script lang="ts">
  import 'leaflet/dist/leaflet.css';
  import { addLayer, createTileLayer } from '../lib/layers';
  import { getMapLayersContext } from '../lib/contexts';
  import { map as initialiseMap } from 'leaflet';
  import { onMount } from 'svelte';

  const { mapContext, layersContext } = getMapLayersContext();

  onMount(() => {
    const map = initialiseMap('map');
    map.setView([18.78911, 98.98514], 13);

    const defaultLayer = createTileLayer('Basemap', 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');

    mapContext.set(map);
    layersContext.update(layers => addLayer(map, layers, defaultLayer));
  });
</script>

<div id="map" class="w-100 h-full"></div>
