<script lang="ts">
  import 'leaflet/dist/leaflet.css';
  import { AppBasemapLayer } from '../lib/layers/basemap';
  import { AppGeoJSONLayer } from '../lib/layers/features/geojson';
  import { getMapLayersContext } from '../lib/contexts';
  import { map as initialiseMap } from 'leaflet';
  import { onMount } from 'svelte';
    import { AppWKXLayer } from '../lib/layers/features/wkx';

  const { mapContext, layersContext } = getMapLayersContext();

  onMount(() => {
    const map = initialiseMap('map');
    map.setView([18.78911, 98.98514], 13);

    $layersContext.setMap(map);

    const defaultLayer = new AppBasemapLayer(
      'OSM Basemap',
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      '<a href="https://www.openstreetmap.org" target="_blank">© OpenStreetMap</a>'
    );
    const featureLayer = new AppGeoJSONLayer({ name: 'Test', raw: '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"dataText":"abc","dataNumber":1,"dataBoolean":false},"geometry":{"coordinates":[98.98140303674813,18.792541512343803],"type":"Point"}},{"type":"Feature","properties":{"dataNumber":5,"dataBoolean":true},"geometry":{"coordinates":[98.98944028711247,18.78414681819163],"type":"Point"}}]}' });
    const featureLayer2 = new AppWKXLayer({ name: 'Line', raw: 'LINESTRING(98.993034 18.787733,98.99033 18.787855,98.990073 18.79074,98.987884 18.790699,98.987713 18.793015,98.986554 18.793096,98.986082 18.79074,98.984323 18.790699,98.984452 18.789602,98.982521 18.789561,98.982735 18.788667,98.98192 18.785783)' });

    mapContext.set(map);
    $layersContext.addLayer(defaultLayer);
    $layersContext.addLayer(featureLayer);
    $layersContext.addLayer(featureLayer2);
  });
</script>

<div id="map" class="w-100 h-full"></div>
