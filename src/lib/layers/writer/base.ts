import type { AppLayer } from '../layer';

export abstract class LayerWriterBase {
  protected _name: string;
  protected _mime: string;
  protected _extension: string;

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
  public abstract getLayerContent(layer: AppLayer): Uint8Array;

  public download(layer: AppLayer) {
    const url = window.URL.createObjectURL(new Blob([this.getLayerContent(layer)], {
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
};
