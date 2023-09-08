<script lang="ts">
  export let value: string;
  export let columns: string[]|undefined = undefined;
</script>

{#if columns && columns.length}
  <select class="input" bind:value>
    {#each columns as field}
      <option value={field}>{field}</option>
    {/each}
  </select>
{:else}
  <input type="text" class="input" bind:value>
{/if}
