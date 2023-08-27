<script lang="ts">
  import { tileLayer, type Layer } from 'leaflet';
  import Map from './components/Map.svelte';

  const layers: Layer[] = [
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
  ];
</script>

<main>
  <Map layers={layers} />
</main>

<style></style>
