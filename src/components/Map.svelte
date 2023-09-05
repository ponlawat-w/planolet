<script lang="ts">
  import 'leaflet/dist/leaflet.css';
  import { getMapLayersContext } from '../lib/contexts';
  import { map as initialiseMap } from 'leaflet';
  import { onMount } from 'svelte';
  import { addBasemapLayer, createBasemapLayer } from '../lib/layers/basemap';
  import { createFeatureLayer, rawToAppFeatureLayerData } from '../lib/layers/feature';
  import { addObjectLayer } from '../lib/layers/object';

  const { mapContext, layersContext } = getMapLayersContext();

  onMount(() => {
    const map = initialiseMap('map');
    map.setView([18.78911, 98.98514], 13);

    const defaultLayer = createBasemapLayer('OSM Basemap', 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    const featureLayer = createFeatureLayer('Test', rawToAppFeatureLayerData('{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"dataText":"abc","dataNumber":1,"dataBoolean":false},"geometry":{"coordinates":[98.98140303674813,18.792541512343803],"type":"Point"}},{"type":"Feature","properties":{"dataNumber":5,"dataBoolean":true},"geometry":{"coordinates":[98.98944028711247,18.78414681819163],"type":"Point"}}]}'));

    mapContext.set(map);
    layersContext.update(layers => {
      layers = { ...layers, basemaps: addBasemapLayer(map, layers.basemaps, defaultLayer) };
      layers = { ...layers, objects: addObjectLayer(map, layers.objects, featureLayer) };
      return layers;
    });
  });
</script>

<div id="map" class="w-100 h-full"></div>
