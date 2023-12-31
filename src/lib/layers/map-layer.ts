import type { Layer } from 'leaflet';
import { AppLayer } from './layer';

export abstract class AppMapLayer<LeafletLayerType extends Layer = Layer> extends AppLayer {
  public visible: boolean = true;
  public leaflet?: LeafletLayerType = undefined;

  public constructor(params: undefined|{ name?: string, visible?: boolean, leaflet?: LeafletLayerType } = undefined) {
    super(params.name);
    if (params) {
      if (params.visible) this.visible = params.visible;
      if (params.leaflet) this.leaflet = params.leaflet;
    }
  }
};
