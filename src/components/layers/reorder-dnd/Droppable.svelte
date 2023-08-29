<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let dragging: boolean;
  let dragover: boolean = false;

  const dispatch = createEventDispatcher<{ drop: DragEvent & { currentTarget: EventTarget & HTMLDivElement } }>();
</script>

<div class="!m-0"
  class:h-1={!dragging}
  class:h-2={dragging}
  class:invisible={!dragging}
  class:bg-surface-200={!dragover}
  class:bg-surface-400={dragover}
  on:dragenter={() => { dragover = true; }} on:dragleave={() => { dragover = false; }} on:dragover|preventDefault
  on:drop={e => { dragover = false; dispatch('drop', e); }}>
  &nbsp;
</div>

<style></style>
