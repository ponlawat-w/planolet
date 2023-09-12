import { CircleMarker, FeatureGroup, Layer, type LayerOptions, Polyline, Polygon } from 'leaflet';
import type { RendererFeatureGroupStyle } from './renderer';

export class RendererFeatureGroup extends FeatureGroup {
  public readonly id: string;

  public constructor(id: string, layers?: Layer[], layerOptions?: LayerOptions) {
    super(layers, layerOptions);
    this.id = id;
  }

  public setFeaturesStyle(styles: RendererFeatureGroupStyle) {
    for (const layer of this.getLayers()) {
      if (layer instanceof Polygon) layer.setStyle(styles.polygonStyle);
      else if (layer instanceof Polyline) layer.setStyle(styles.lineStringStyle);
      else if (layer instanceof CircleMarker) layer.setStyle(styles.pointStyle);
    }
  }

  public hide() {
    this.setStyle({ opacity: 0, fillOpacity: 0 });
  }

  public show() {
    this.setStyle({ opacity: 1, fillOpacity: 1 });
  }
};
