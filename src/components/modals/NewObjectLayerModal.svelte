<script lang="ts">
  import { AppFeatureLayerDataType, createFeatureLayer, rawToAppFeatureLayerData, rawToAppFeatureLayerType } from '../../lib/layers/feature';
  import { getExceptionErrorToast } from '../../lib/toasts';
  import { FileDropzone, modalStore, toastStore } from '@skeletonlabs/skeleton';
  import type { AppObjectLayer } from '../../lib/layers/object';
  import type { ModalParent } from '../../types';

  export let parent: ModalParent;

  enum InputMode {
    URL, File, Text
  };

  let mode: InputMode = InputMode.URL;
  let type: AppFeatureLayerDataType = undefined;
  let name: string = '';
  let url: string = undefined;
  let files: FileList = undefined;
  let text: string = undefined;
  let loading: boolean = false;
  let valid: boolean = false;

  $: if (mode === InputMode.URL) {
    url = '';
  } else if (mode === InputMode.File) {
    files = undefined;
  } else if (mode === InputMode.Text) {
    text = '';
  }

  const filesChanged = () => {
    if (!files || !files.length) {
      name = '';
      return;
    }
    if (!name) {
      name = files.item(0).name;
    }
  };

  $: if (mode || url || files || text) {
    type = undefined;
    if (mode === InputMode.URL) {
      valid = /^http[s]?:\/\/.*/g.test(url);
    } else if (mode === InputMode.File) {
      valid = (files && files.length && files.item(0)) ? true : false;
      filesChanged();
    } else if (mode === InputMode.Text) {
      type = rawToAppFeatureLayerType(text);
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
    const data = await response.json();
    return createFeatureLayer(name, data, url);
  };

  const getLayerFromFile = (): Promise<AppObjectLayer> => new Promise((resolve, reject) => {
    try {
      if (!files || !files.length) {
        throw new Error('Uploaded file is empty');
      }
      const file = files.item(0);
      const fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = e => {
        try {
          const content = e.target.result.toString();
          const data = rawToAppFeatureLayerData(content);
          resolve(createFeatureLayer(name, data));
        } catch (ex) {
          reject(ex);
        }
      };
    } catch (ex) {
      reject(ex);
    }
  });

  const getLayerFromText = (): AppObjectLayer => {
    const data = rawToAppFeatureLayerData(text);
    return createFeatureLayer(name, data);
  };

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
        layer = await getLayerFromFile();
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
        <label class="inline mr-2">
          <input type="radio" bind:group={mode} value={InputMode.URL} disabled={loading}>
          URL
        </label>
        <label class="inline mr-2">
          <input type="radio" bind:group={mode} value={InputMode.File} disabled={loading}>
          File
        </label>
        <label class="inline">
          <input type="radio" bind:group={mode} value={InputMode.Text} disabled={loading}>
          Text
        </label>
      </div>
      {#if mode === InputMode.URL}
      <div class="input-group grid-cols-[auto_1fr]">
        <div class="input-group-shim">URL</div>
        <input type="text" class="input font-mono" placeholder="https://" bind:value={url} disabled={loading}>
      </div>
      {:else if mode === InputMode.File}
        {#if files && files.length}
          <span class="badge variant-filled-primary">
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
        <div>
          <strong>Input Type:</strong>
          {#if type === AppFeatureLayerDataType.Unknown}
            Unknown
          {:else if type === AppFeatureLayerDataType.GeoJSON}
            GeoJSON
          {:else if type === AppFeatureLayerDataType.WKT}
            Well-Known Text (WKT)
          {/if}
        </div>
      {/if}
    </section>
    <footer class="card-footer text-right">
      <button type="submit" class="btn variant-filled-success" disabled={!valid || loading}>{loading ? 'Loading': 'Add'}</button>
    </footer>
  </form>
</div>
