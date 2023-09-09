import { CircleMarker, FeatureGroup, Layer, type CircleMarkerOptions, type LayerOptions, type PathOptions, Polyline, Polygon } from 'leaflet';
import type { RendererFeatureGroupStyle } from './renderer';

export class RendererFeatureGroup extends FeatureGroup {
  public readonly id: string;

  public constructor(id: string, layers?: Layer[], layerOptions?: LayerOptions) {
    super(layers, layerOptions);
    this.id = id;
  }

  public setFeaturesStyle(styles: RendererFeatureGroupStyle) {
    for (const layer of this.getLayers()) {
      if (layer instanceof Polygon) return layer.setStyle(styles.polygonStyle);
      if (layer instanceof Polyline) return layer.setStyle(styles.lineStringStyle);
      if (layer instanceof CircleMarker) return layer.setStyle(styles.pointStyle);
    }
  }
};
