import { RendererFeatureGroup } from './feature-group';
import { FeatureRenderer, type RendererFeatureGroupStyle, type RendererGeometry } from './renderer';

export class RendererFeatureGroupCollection {
  public readonly layers: RendererFeatureGroup[] = [];

  public constructor(layers: RendererFeatureGroup[] = []) {
    this.layers = layers;
  }

  public getFromId(id: string): RendererFeatureGroup|undefined {
    const layers = this.layers.filter(x => x.id === id);
    return layers.length ? layers[0] : undefined;
  }

  public setStyle(id: string, style: RendererFeatureGroupStyle) {
    const layer = this.getFromId(id);
    if (!layer) return;
    layer.setFeaturesStyle(style);
  }

  public setAllStyles(style: RendererFeatureGroupStyle) {
    for (const layer of this.layers) {
      layer.setFeaturesStyle(style);
    }
  }

  public static createFromGeometries(geometries: RendererGeometry[]): RendererFeatureGroupCollection {
    return new RendererFeatureGroupCollection(geometries.map(x => new RendererFeatureGroup(x.id, FeatureRenderer.geometryToLayers(x.geometry))));
  }
};
