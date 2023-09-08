<script lang="ts">
  import { modalStore } from '@skeletonlabs/skeleton';

  export let title: string = '';
  export let disabled: boolean = false;
  export let submitText: string = 'Submit';
  export let submitIconClass: string = undefined;
</script>

<div class="card w-modal">
  <form on:submit|preventDefault>
    <header class="card-header">
      {title}
      <button type="button" class="btn btn-sm float-right" on:click={modalStore.close}>
        <i class="fa fa-times"></i>
      </button>
    </header>
    <section class="p-4">
      <slot />
    </section>
    <footer class="card-footer text-right">
      <button type="submit" class="btn variant-filled-success" disabled={disabled}>
        {#if submitIconClass}<i class={submitIconClass}></i>{/if}
        {submitText}
      </button>
    </footer>
  </form>
</div>
