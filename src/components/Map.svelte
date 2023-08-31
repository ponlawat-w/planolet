<script lang="ts">
  import 'leaflet/dist/leaflet.css';
  import { getMapLayersContext } from '../lib/contexts';
  import { map as initialiseMap } from 'leaflet';
  import { onMount } from 'svelte';
  import { addBasemapLayer, createBasemapLayer } from '../lib/layers/basemap';
  import { createFeatureLayer } from '../lib/layers/feature';
  import { addObjectLayer } from '../lib/layers/object';

  const { mapContext, layersContext } = getMapLayersContext();

  onMount(() => {
    const map = initialiseMap('map');
    map.setView([18.78911, 98.98514], 13);

    const defaultLayer = createBasemapLayer('OSM Basemap', 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    const featureLayer = createFeatureLayer('Test', {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [98.98546, 18.78852]
          },
          properties: {}
        }, {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [98.98675, 18.78706]
          },
          properties: {}
        }
      ]
    });
    const featureLayer2 = createFeatureLayer('Test 2', {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [98.98602, 18.78773]
          },
          properties: {
            color: '#0000ff'
          }
        }
      ]
    });

    mapContext.set(map);
    layersContext.update(layers => {
      layers = { ...layers, basemaps: addBasemapLayer(map, layers.basemaps, defaultLayer) };
      layers = { ...layers, objects: addObjectLayer(map, layers.objects, featureLayer) };
      layers = { ...layers, objects: addObjectLayer(map, layers.objects, featureLayer2) };
      return layers;
    });
  });
</script>

<div id="map" class="w-100 h-full"></div>
