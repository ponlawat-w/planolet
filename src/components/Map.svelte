<script lang="ts">
  import 'leaflet/dist/leaflet.css';
  import { getMapLayersContext } from '../lib/contexts';
  import { map as initialiseMap } from 'leaflet';
  import { onMount } from 'svelte';
  import { addBasemapLayer, createBasemapLayer } from '../lib/layers/basemap';

  const { mapContext, layersContext } = getMapLayersContext();

  onMount(() => {
    const map = initialiseMap('map');
    map.setView([18.78911, 98.98514], 13);

    const defaultLayer = createBasemapLayer('OSM Basemap', 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');

    mapContext.set(map);
    layersContext.update(layers => {
      layers = { ...layers, basemaps: addBasemapLayer(map, layers.basemaps, defaultLayer) };
      return layers;
    });
  });
</script>

<div id="map" class="w-100 h-full"></div>
