<script lang="ts">
  import './theme.postcss';
  import '@skeletonlabs/skeleton/styles/skeleton.css';
  import './app.postcss';
  import '@fortawesome/fontawesome-free/css/all.min.css';
  
  import { afterUpdate, beforeUpdate, setContext } from 'svelte';
  import { AppBar, AppShell, Modal, Toast } from '@skeletonlabs/skeleton';
  import { AppFeatureLayerBase } from './lib/layers/features/base';
  import { AppLayers } from './lib/layers/layers';
  import { CONTEXT_LAYERS, CONTEXT_MAP, type ContextSelectedLayer, type ContextLayers, type ContextMap, CONTEXT_SELECTED_LAYER } from './lib/contexts';
  import { isDarkMode } from './lib/theme';
  import { writable } from 'svelte/store';
  import AttributesTable from './components/table/AttributesTable.svelte';
  import LayerInfo from './components/layers/LayerInfo.svelte';
  import LayersBar from './components/layers/LayersList.svelte';
  import Map from './components/Map.svelte';

  const layers = new AppLayers();
  
  const mapContext = setContext<ContextMap>(CONTEXT_MAP, writable(undefined));
  const layersContext = setContext<ContextLayers>(CONTEXT_LAYERS, layers.context);
  const selectedLayerContext = setContext<ContextSelectedLayer>(CONTEXT_SELECTED_LAYER, writable(undefined));
  
  $: if ($isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  let shouldRerenderLayers: boolean = false;
  layersContext.subscribe(() => {
    shouldRerenderLayers = true;
  });

  let showLeftBar = true;
  let showRightBar = true;
  let showBottomBar = true;

  const toggleLeftBar = () => { showLeftBar = !showLeftBar; };
  const toggleRightBar = () => { showRightBar = !showRightBar; };
  const toggleBottomBar = () => { showBottomBar = !showBottomBar; };

  let lastShowLeftBar = showLeftBar;
  let lastShowRightBar = showRightBar;
  let lastShowBottomBar = showBottomBar;
  let lastSelectedLayer = $selectedLayerContext;
  beforeUpdate(() => {
    if (!lastSelectedLayer && $selectedLayerContext) {
      showRightBar = true;
      showBottomBar = true;
    }
  });
  afterUpdate(() => {
    if (lastShowLeftBar !== showLeftBar
      || lastShowRightBar !== showRightBar
      || lastShowBottomBar !== showBottomBar
      || lastSelectedLayer !== $selectedLayerContext) {
      $mapContext.invalidateSize();
      lastShowLeftBar = showLeftBar;
      lastShowRightBar = showRightBar;
      lastShowBottomBar = showBottomBar;
      lastSelectedLayer = $selectedLayerContext;
    }
    if (shouldRerenderLayers) {
      $layersContext.reorderLeafletDisplay();
    }
  });
</script>

<Modal zIndex="z-[1001]" /><Toast zIndex="z-[1002]" />
<AppShell
  slotPageContent="overflow-y-hidden"
  slotSidebarLeft={showLeftBar ? 'w-32 sm:w-48 lg:w-60' : 'w-2'}
  slotSidebarRight={$selectedLayerContext ? (showRightBar ? 'w-48 sm:w-52 lg:w-72' : 'w-2') : 'hidden'}
  slotPageFooter={$selectedLayerContext && $selectedLayerContext instanceof AppFeatureLayerBase ? '' : 'hidden'}
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
  <svelte:fragment slot="pageFooter">
    <div>
      <div class="grid h-3">
        <button class="justify-self-center btn btn-sm text-xs bg-surface-200 text-black w-auto py-0 px-5 h-2" on:click={toggleBottomBar}>
          <i class="fa" class:fa-angle-down={showBottomBar} class:fa-angle-up={!showBottomBar}></i>
        </button>
      </div>
      {#if showBottomBar}<AttributesTable />{/if}
    </div>
  </svelte:fragment>
</AppShell>

<style></style>
