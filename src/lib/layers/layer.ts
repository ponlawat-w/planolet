import type { ContextSelectedFeatureId, ContextSelectedLayer } from '../contexts';

export abstract class AppLayer {
  public static selectedLayerContext: ContextSelectedLayer;
  public static selectedFeatureIdContext: ContextSelectedFeatureId;

  public name: string;

  public constructor(name: string) {
    this.name = name;
  }
};
