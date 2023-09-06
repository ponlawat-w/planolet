import type { Layer } from 'leaflet';

export abstract class AppMapLayer {
  public name: string = '';
  public visible: boolean = true;
  public leaflet?: Layer = undefined;

  public constructor(data: undefined|{ name?: string, visible?: boolean, leaflet?: Layer } = undefined) {
    if (data) {
      if (data.name) this.name = data.name;
      if (data.visible) this.visible = data.visible;
      if (data.leaflet) this.leaflet = data.leaflet;
    }
  }
};
