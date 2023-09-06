<script lang="ts">
  import 'leaflet/dist/leaflet.css';
  import { AppBasemapLayer } from '../lib/layers/basemap';
  import { AppGeoJSONLayer } from '../lib/layers/features/geojson';
  import { getMapLayersContext } from '../lib/contexts';
  import { map as initialiseMap } from 'leaflet';
  import { onMount } from 'svelte';

  const { mapContext, layersContext } = getMapLayersContext();

  onMount(() => {
    const map = initialiseMap('map');
    map.setView([18.78911, 98.98514], 13);

    $layersContext.setMap(map);

    const defaultLayer = new AppBasemapLayer('OSM Basemap', 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    const featureLayer = new AppGeoJSONLayer({ name: 'Test', raw: '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"dataText":"abc","dataNumber":1,"dataBoolean":false},"geometry":{"coordinates":[98.98140303674813,18.792541512343803],"type":"Point"}},{"type":"Feature","properties":{"dataNumber":5,"dataBoolean":true},"geometry":{"coordinates":[98.98944028711247,18.78414681819163],"type":"Point"}}]}' });

    mapContext.set(map);
    $layersContext.addLayer(defaultLayer);
    $layersContext.addLayer(featureLayer);
  });
</script>

<div id="map" class="w-100 h-full"></div>
