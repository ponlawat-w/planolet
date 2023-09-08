import { modalStore, type ModalComponent, type ModalSettings, toastStore } from '@skeletonlabs/skeleton';
import type { AppLayer } from '../layer';
import { getExceptionErrorToast } from '../../toasts';

export abstract class LayerWriterBase<T = undefined> {
  protected _name: string;
  protected _mime: string;
  protected _extension: string;
  protected _optionsModalComponent: ModalComponent = undefined;

  public get name(): string { return this._name; }
  public get mime(): string { return this._mime; }
  public get extension(): string { return this._extension; }

  public constructor(
    name: string,
    mime: string,
    extension: string
  ) {
    this._name = name;
    this._mime = mime;
    this._extension = extension;
  }

  public abstract layerWritable(layer: AppLayer): boolean;
  public abstract getLayerContent(layer: AppLayer, options?: T): Uint8Array;

  public download(layer: AppLayer, options?: T) {
    const url = window.URL.createObjectURL(new Blob([this.getLayerContent(layer, options)], {
      type: 'data:' + this._mime
    }));

    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', layer.name + '.' + this._extension);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  protected downloadUI(layer: AppLayer, options?: T) {
    try {
      this.download(layer, options);
    } catch (ex) {
      toastStore.trigger(getExceptionErrorToast('Unable to download', ex));
    }
  }

  public trigger(layer: AppLayer) {
    if (!this._optionsModalComponent) {
      return this.downloadUI(layer);
    }
    const optionsModal: ModalSettings = {
      type: 'component',
      component: this._optionsModalComponent,
      response: (res?: { submit: boolean, options?: T }) => res && res.submit === true && this.downloadUI(layer, res.options)
    };
    modalStore.trigger(optionsModal);
  }
};
