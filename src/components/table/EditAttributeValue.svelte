<script lang="ts">
  import type { TableCell, TableColumn } from '../../lib/table/types';

  export let column: TableColumn;
  export let value: TableCell;
  export let generalClass: string = '';
  export let inputClass: string = '';
  export let checkboxClass: string = '';
  export let readonly: boolean = false;
  export let disabled: boolean = false;

  let elementClass: string;
  $: elementClass = [generalClass, inputClass, checkboxClass].filter(x => x).join(' ');

  $: if (column.type === 'boolean' && typeof value !== 'boolean') value = value ? true : false;
</script>

{#if column.type === 'uuid' || column.type === 'string'}
  <input type="text" bind:value={value} class={elementClass} readonly={readonly} disabled={disabled} on:keydown on:keyup on:keypress on:change on:focus on:blur>
{:else if column.type === 'number'}
  <input type="number" bind:value={value} class={elementClass} readonly={readonly} disabled={disabled} on:keydown on:keyup on:keypress on:change on:focus on:blur>
{:else if column.type === 'boolean' && typeof value === 'boolean'}
  <input type="checkbox" bind:checked={value} class={'w-4 ' + elementClass} disabled={disabled} on:change on:focus on:blur>
{:else if column.type === 'bytes'}
  <input type="text" value="BYTES" class={elementClass} readonly={readonly} disabled={disabled}>
{/if}
