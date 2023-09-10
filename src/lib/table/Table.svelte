<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TableDataSource } from './table';

  export let data: TableDataSource;
  export let selectedId: string|undefined = undefined;

  type Events = {
    click: string|undefined,
    mouseenter: string|undefined,
    mouseleave: string|undefined
  };

  const dispatch = createEventDispatcher<Events>();
</script>

{#if data && data.columns.length}
  <table class="table">
    <thead>
      <tr>
        {#each data.columns as column}<th class="!p-2">{column}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each data.rows as row}
      <tr class:hover:!bg-tertiary-500={selectedId !== row.id}
        class:hover:!bg-secondary-400={selectedId === row.id}
        class:!bg-secondary-300={selectedId === row.id}
        on:click={() => dispatch('click', row.id)}
        on:mouseenter={() => dispatch('mouseenter', row.id)}
        on:mouseleave={() => dispatch('mouseleave', row.id)}>
        {#each row.data as cell}
          <td class="!p-2">
            {cell !== undefined && cell !== null ? cell : ''}
          </td>
        {/each}
      </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <div class="text-center">
    This layer does not have attributes table.
  </div>
{/if}
