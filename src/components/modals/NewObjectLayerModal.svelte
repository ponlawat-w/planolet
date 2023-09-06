<script lang="ts">
  import { AppFeatureLayer, AppFeatureLayerDataType } from '../../lib/layers/features/feature';
  import { FileDropzone, modalStore, toastStore } from '@skeletonlabs/skeleton';
  import { getDefaultCsvTableOptions, type CSVGeospaitaliseOptions } from '../../lib/layers/features/csv';
  import { getExceptionErrorToast } from '../../lib/toasts';
  import { readFileAsText } from '../../lib/file';
  import CsvOptions from './CsvOptions.svelte';
  import type { AppObjectLayer } from '../../lib/layers/object';
  import type { ModalParent } from '../../types';

  export let parent: ModalParent;

  enum InputMode {
    URL, File, Text
  };

  let mode: InputMode = InputMode.Text;
  let type: AppFeatureLayerDataType = AppFeatureLayerDataType.Unknown;
  let name: string = '';
  let url: string = undefined;
  let files: FileList = undefined;
  let text: string = undefined;
  let csvOptions: CSVGeospaitaliseOptions = getDefaultCsvTableOptions();
  let loading: boolean = false;
  let valid: boolean = false;

  $: if (mode === InputMode.URL) {
    url = '';
  } else if (mode === InputMode.File) {
    files = undefined;
    text = undefined;
    csvOptions = getDefaultCsvTableOptions();
  } else if (mode === InputMode.Text) {
    text = '';
    csvOptions = getDefaultCsvTableOptions();
  }

  const filesChanged = async() => {
    if (!files || !files.length) {
      name = '';
      text = undefined;
      return;
    }
    if (!name) {
      const file = files.item(0);
      name = file.name;
      text = await readFileAsText(file);
    }
  };

  $: if (mode || url || files || text) {
    type = AppFeatureLayerDataType.Unknown;
    if (mode === InputMode.URL) {
      valid = /^http[s]?:\/\/.*/g.test(url);
    } else if (mode === InputMode.File) {
      filesChanged();
      type = AppFeatureLayer.rawToType(text);
      valid = type !== AppFeatureLayerDataType.Unknown ? true: false;
    } else if (mode === InputMode.Text) {
      type = AppFeatureLayer.rawToType(text);
      valid = type !== AppFeatureLayerDataType.Unknown ? true: false;
    }
  } else {
    valid = false;
  }

  const getLayerFromUrl = async(): Promise<AppObjectLayer> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.status.toString());
    }
    return AppFeatureLayer.createFromRaw(name, await response.text(), csvOptions);
  };

  const getLayerFromFile = (): AppObjectLayer => AppFeatureLayer.createFromRaw(name, text, csvOptions);

  const getLayerFromText = (): AppObjectLayer => AppFeatureLayer.createFromRaw(name, text, csvOptions);

  const submit = async() => {
    if (!valid) {
      return;
    }
    try {
      loading = true;
      name = name.trim() === '' ? 'Untitled' : name;
      let layer: AppObjectLayer = undefined;

      if (mode === InputMode.URL) {
        layer = await getLayerFromUrl();
      } else if (mode === InputMode.File) {
        layer = getLayerFromFile();
      } else if (mode === InputMode.Text) {
        layer = getLayerFromText();
      } else {
        throw new Error('Unsupported input mode');
      }

      if (!layer) {
        throw new Error();
      }
      if ($modalStore[0].response && layer) {
        $modalStore[0].response(layer);
      }
      modalStore.close();
    } catch (ex: any|Error) {
      toastStore.trigger(getExceptionErrorToast(`Cannot add feature layer "${name}"`, ex));
    } finally { 
      loading = false;
    }
  };
</script>

<div class="card w-modal">
  <form on:submit|preventDefault={submit}>
    <header class="card-header">
      <i class="fa-solid fa-plus-circle"></i>
      Add a new feature layer
      <button type="button" class="btn btn-sm float-right" on:click={modalStore.close}>
        <i class="fa fa-times"></i>
      </button>
    </header>
    <section class="p-4">
      {#if !parent}<slot />{/if}
      <div class="input-group mb-2 grid-cols-[auto_1fr]">
        <div class="input-group-shim">Layer Name</div>
        <input type="text" class="input" bind:value={name}>
      </div>
      <div class="mb-2">
        <span class="inline mr-2">
          Input Mode:
        </span>
        <label class="inline">
          <input type="radio" bind:group={mode} value={InputMode.Text} disabled={loading}>
          Text
        </label>
        <label class="inline mr-2">
          <input type="radio" bind:group={mode} value={InputMode.File} disabled={loading}>
          File
        </label>
        <label class="inline mr-2">
          <input type="radio" bind:group={mode} value={InputMode.URL} disabled={loading}>
          URL
        </label>
      </div>
      {#if mode === InputMode.URL}
        <div class="input-group grid-cols-[auto_1fr]">
          <div class="input-group-shim">URL</div>
          <input type="text" class="input font-mono" placeholder="https://" bind:value={url} disabled={loading}>
        </div>
      {:else if mode === InputMode.File}
        {#if files && files.length}
          <span class="badge variant-filled-primary mb-2">
            {files[0].name}
            <button type="button" class="btn py-0 pr-0 pl-2" on:click={() => { files = undefined; }} disabled={loading}>
              <i class="fa fa-times"></i>
            </button>
          </span>
        {:else}
          <FileDropzone name="files" multiple="false" on:change={filesChanged} bind:files={files} disabled={loading} />
        {/if}
      {:else if mode === InputMode.Text}
        <textarea class="input w-100 h-72 font-mono" bind:value={text} disabled={loading}></textarea>
        <div class="text-xs text-tertiary-900">
          <i class="fa fa-info-circle text-primary-500"></i>
          Supports: GeoJSON / Well-Known Text (WKT) / Well-Known Bytes (WKB) in Hex or Base64 string
        </div>
      {/if}
      {#if (mode === InputMode.File && files && files.length) || mode === InputMode.Text}
        <div>
          <strong>Input Type:</strong>
          {#if type === AppFeatureLayerDataType.Unknown}
            <span class="text-error-500">
              <i class="fa fa-times-circle"></i>
              Unknown
            </span>
          {:else}
            <span class="text-success-700">
              <i class="fa fa-check-circle"></i>
              {#if type === AppFeatureLayerDataType.GeoJSON}
              GeoJSON
              {:else if type === AppFeatureLayerDataType.WKX}
              Well-Known Geometry (WKT or WKB)
              {:else if type === AppFeatureLayerDataType.CSV}
              Comma-Separated Values (CSV)
              {/if}
            </span>
          {/if}
        </div>
      {/if}
      {#if type === AppFeatureLayerDataType.CSV}
        <CsvOptions content={text} bind:options={csvOptions} />
      {/if}
    </section>
    <footer class="card-footer text-right">
      <button type="submit" class="btn variant-filled-success" disabled={!valid || loading}>{loading ? 'Loading': 'Add'}</button>
    </footer>
  </form>
</div>
