import { AppMapLayer } from './map-layer';
import { TileLayer } from 'leaflet';
import { v4 } from 'uuid';

export class AppBasemapLayer extends AppMapLayer {
  public pane: string = v4();
  public url: string;

  public constructor(name: string, url: string) {
    super({ name });
    this.url = url;
    this.leaflet = new TileLayer(this.url);
  }

  public static urlValid(url: string): boolean {
    return (url.startsWith('http://') || url.startsWith('https://')) && url.includes('{x}') && url.includes('{y}') && url.includes('z');
  }
};
