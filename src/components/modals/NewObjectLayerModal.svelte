<script lang="ts">
  import { AppCSVLayer } from '../../lib/layers/features/csv';
  import { AppFeatureLayer, AppFeatureLayerDataType } from '../../lib/layers/features/feature';
  import { FileDropzone, modalStore, toastStore } from '@skeletonlabs/skeleton';
  import { getExceptionErrorToast } from '../../lib/toasts';
  import { readFileAsText } from '../../lib/file';
  import CsvOptionsForm from '../../lib/csv/CSVOptionsForm.svelte';
  import FormModal from '../../lib/modals/FormModal.svelte';
  import type { AppObjectLayer } from '../../lib/layers/object';
  import type { CSVOptions } from '../../lib/csv/options';
  import type { DataTable } from '../../lib/table';
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
  let csvInterpretResult: { options: CSVOptions, preview: DataTable }|undefined = undefined;
  let columns: string[]|undefined = undefined;
  $: if (csvInterpretResult) {
    type = AppFeatureLayerDataType.CSV;
    columns = csvInterpretResult.preview.headers.map(x => x.name);
  } else {
    columns = undefined;
  }

  let loading: boolean = false;
  let valid: boolean = false;

  $: if (mode === InputMode.URL) {
    url = '';
  } else if (mode === InputMode.File) {
    files = undefined;
    text = undefined;
    csvInterpretResult = undefined;
  } else if (mode === InputMode.Text) {
    text = '';
    csvInterpretResult = undefined;
  }

  const clearFiles = () => {
    files = undefined;
    name = '';
    csvInterpretResult = undefined;
  };

  const checkInput = (csvMinColumns: number) => {
    csvInterpretResult = undefined;
    type = AppFeatureLayer.rawToType({ raw: text });
    if (type !== AppFeatureLayerDataType.Unknown) return;
    csvInterpretResult = AppCSVLayer.tryGetOptionsFromRaw(text, csvMinColumns);
    if (csvInterpretResult && csvInterpretResult.options) type = AppFeatureLayerDataType.CSV;
  };

  const updateData = async() => {
    type = AppFeatureLayerDataType.Unknown;
    if (mode === InputMode.URL) {
      valid = /^http[s]?:\/\/.*/g.test(url);
    } else if (mode === InputMode.File) {
      checkInput(1);
      valid = type !== AppFeatureLayerDataType.Unknown ? true: false;
    } else if (mode === InputMode.Text) {
      checkInput(2);
      valid = type !== AppFeatureLayerDataType.Unknown ? true: false;
    } else {
      valid = false;
    }
  };

  const filesChanged = async() => {
    if (!files || !files.length) {
      name = '';
      text = undefined;
      valid = false;
      return;
    }
    const file = files.item(0);
    if (!name) name = file.name;
    text = await readFileAsText(file);
    updateData();
  };
  $: if (files) {
    filesChanged();
  }

  const getLayerFromUrl = async(): Promise<AppObjectLayer> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.status.toString());
    }
    const raw = await response.text();
    csvInterpretResult = AppCSVLayer.tryGetOptionsFromRaw(raw, 2);
    if (csvInterpretResult) {
      text = raw;
      return;
    }
    return AppFeatureLayer.createFromRaw({ name, raw });
  };

  const getLayerFromFile = (): AppObjectLayer => AppFeatureLayer.createFromRaw({ name, raw: text, csvOptions: csvInterpretResult?.options ?? undefined });

  const getLayerFromText = (): AppObjectLayer => AppFeatureLayer.createFromRaw({ name, raw: text, csvOptions: csvInterpretResult?.options ?? undefined });

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

<FormModal on:submit={submit} disabled={!valid || loading} submitText={loading ? 'Loading': 'Add'} title="Add a new feature layer">
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
      <input type="radio" bind:group={mode} value={InputMode.Text} disabled={loading} on:change={updateData}>
      Text
    </label>
    <label class="inline mr-2">
      <input type="radio" bind:group={mode} value={InputMode.File} disabled={loading} on:change={updateData}>
      File
    </label>
    <label class="inline mr-2">
      <input type="radio" bind:group={mode} value={InputMode.URL} disabled={loading} on:change={updateData}>
      URL
    </label>
  </div>
  {#if mode === InputMode.URL}
    <div class="input-group grid-cols-[auto_1fr]">
      <div class="input-group-shim">URL</div>
      <input type="text" class="input font-mono" placeholder="https://" bind:value={url} disabled={loading} on:keyup={updateData} on:change={updateData}>
    </div>
  {:else if mode === InputMode.File}
    {#if files && files.length}
      <span class="badge variant-filled-primary mb-2">
        {files[0].name}
        <button type="button" class="btn py-0 pr-0 pl-2" on:click={clearFiles} disabled={loading}>
          <i class="fa fa-times"></i>
        </button>
      </span>
    {:else}
      <FileDropzone name="files" multiple="false" on:change={updateData} bind:files={files} disabled={loading} />
    {/if}
  {:else if mode === InputMode.Text}
    <textarea class="input w-100 h-72 font-mono" bind:value={text} on:keyup={updateData} on:change={updateData} disabled={loading}></textarea>
    <div class="text-xs text-tertiary-900">
      <i class="fa fa-info-circle text-primary-500"></i>
      Supports: GeoJSON / Well-Known Text (WKT) / Well-Known Bytes (WKB) in Hex or Base64 string
    </div>
  {/if}
  {#if (mode === InputMode.File && files && files.length) || mode === InputMode.Text}
    <div>
      <strong>Input Type:</strong>
      {#if type === AppFeatureLayerDataType.Unknown}
        <span class="text-error-500 dark:text-error-300">
          <i class="fa fa-times-circle"></i>
          Unknown
        </span>
      {:else}
        <span class="text-success-700 dark:text-success-500">
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
  {#if type === AppFeatureLayerDataType.CSV && csvInterpretResult}
    <CsvOptionsForm bind:options={csvInterpretResult.options} columns={columns} />
  {/if}
</FormModal>
