<script lang="ts">
  import './theme.postcss';
  import '@skeletonlabs/skeleton/styles/skeleton.css';
  import './app.postcss';
  import '@fortawesome/fontawesome-free/css/all.min.css';
  
  import { AppBar, AppShell, Modal, Toast } from '@skeletonlabs/skeleton';
  import { CONTEXT_LAYERS, CONTEXT_MAP, type ContextSelectedLayer, type ContextLayers, type ContextMap, CONTEXT_SELECTED_LAYER } from './lib/contexts';
  import { afterUpdate, beforeUpdate, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import LayersBar from './components/layers/LayersList.svelte';
  import Map from './components/Map.svelte';
  import LayerInfo from './components/layers/LayerInfo.svelte';
  
  const mapContext = setContext<ContextMap>(CONTEXT_MAP, writable(undefined));
  setContext<ContextLayers>(CONTEXT_LAYERS, writable([]));
  const selectedLayerContext = setContext<ContextSelectedLayer>(CONTEXT_SELECTED_LAYER, writable(undefined));

  let showLeftBar = true;
  let showRightBar = true;

  const toggleLeftBar = () => {
    showLeftBar = !showLeftBar;
  };
  const toggleRightBar = () => {
    showRightBar = !showRightBar;
  };

  let lastShowLeftBar = showLeftBar;
  let lastShowRightBar = showRightBar;
  let lastSelectedLayer = $selectedLayerContext;
  beforeUpdate(() => {
    if (!lastSelectedLayer && $selectedLayerContext && !showRightBar) {
      showRightBar = true;
    }
  });
  afterUpdate(() => {
    if (lastShowLeftBar !== showLeftBar
      || lastShowRightBar !== showRightBar
      || lastSelectedLayer !== $selectedLayerContext) {
      $mapContext.invalidateSize();
      lastShowLeftBar = showLeftBar;
      lastShowRightBar = showRightBar;
      lastSelectedLayer = $selectedLayerContext;
    }
  });
</script>

<Modal /><Toast />
<AppShell
  slotSidebarLeft={showLeftBar ? 'w-32 sm:w-48 lg:w-60' : 'w-2'}
  slotSidebarRight={$selectedLayerContext ? (showRightBar ? 'w-48 sm:w-52 lg:w-72' : 'w-2') : 'hidden'}
>
  <svelte:fragment slot="header">
    <AppBar background="bg-success-700" class="text-white text-lg">
      Plànolet
    </AppBar>
  </svelte:fragment>
  <svelte:fragment slot="sidebarLeft">
    <div class="relative h-full">
      {#if showLeftBar}
        <LayersBar />
      {/if}
      <button class="absolute btn btn-sm bg-surface-200 text-black w-2 px-0 py-5 right-0 top-1/2" on:click={toggleLeftBar}>
        <i class="fa" class:fa-angle-left={showLeftBar} class:fa-angle-right={!showLeftBar}></i>
      </button>
    </div>
  </svelte:fragment>
  <Map />
  <svelte:fragment slot="sidebarRight">
    <div class="relative h-full">
      {#if $selectedLayerContext && showRightBar}
        <LayerInfo />
      {/if}
      <button class="absolute btn btn-sm bg-surface-200 text-black w-2 px-0 py-5 left-0 top-1/2" on:click={toggleRightBar}>
        <i class="fa" class:fa-angle-right={showRightBar} class:fa-angle-left={!showRightBar}></i>
      </button>
    </div>
  </svelte:fragment>
</AppShell>

<style></style>
