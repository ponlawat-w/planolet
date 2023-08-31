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
    const featureLayer = createFeatureLayer('Point', {
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
    const featureLayer2 = createFeatureLayer('Line', {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [
                98.98008,
                18.79000
              ],
              [
                98.98384,
                18.78714
              ],
              [
                98.99128,
                18.78662
              ],
              [
                98.99231,
                18.79070
              ],
              [
                98.98671,
                18.79418
              ]
            ]
          },
          properties: {}
        }
      ]
    });
    const featureLayer3 = createFeatureLayer('Polygon', {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [
                  98.97846,
                  18.79580
                ],
                [
                  98.97766,
                  18.78162
                ],
                [
                  98.99286,
                  18.78116
                ],
                [
                  98.99360,
                  18.79534
                ],
                [
                  98.97846,
                  18.79580
                ]
              ]
            ]
          },
          properties: {}
        }
      ]
    })

    mapContext.set(map);
    layersContext.update(layers => {
      layers = { ...layers, basemaps: addBasemapLayer(map, layers.basemaps, defaultLayer) };
      layers = { ...layers, objects: addObjectLayer(map, layers.objects, featureLayer3) };
      layers = { ...layers, objects: addObjectLayer(map, layers.objects, featureLayer2) };
      layers = { ...layers, objects: addObjectLayer(map, layers.objects, featureLayer) };
      return layers;
    });
  });
</script>

<div id="map" class="w-100 h-full"></div>
