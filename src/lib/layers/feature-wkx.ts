import type { FeatureCollection } from 'geojson';
import { Geometry } from '../wkx';
import type { AppFeatureLayerData } from './feature';

export type WKXFeatures = {
  type: 'WKT',
  features: Geometry[]
};

export const appFeatureLayerDataIsWKX = (data: AppFeatureLayerData): boolean => data.type && data.type === 'WKT';

export const rawIsWKX = (raw: string): boolean => {
  try {
    return (rawWKXToData(raw) as WKXFeatures).features.length > 0;
  } catch { return false; }
};

export const rawWKXToData = (raw: string): AppFeatureLayerData => ({
  type: 'WKT',
  features: raw.split('\n').map(x => x.trim()).filter(x => x).map(x => Geometry.parse(x))
})

export const wkxFeaturesGetGeometryType = (data: WKXFeatures): string => {
  let type: string;
  for (const feature of data.features) {
    const featureType = feature.toGeoJSON().type;
    if (type && featureType !== type) {
      return `Mixed ${data.type} Collection`;
    }
    type = featureType;
  }
  if (type) {
    return `${data.type} ${type} Collection`;
  }
  return 'Unknown';
};

export const wkxGetFeaturesCount = (data: WKXFeatures) => data.features.length;

export const wkxFeaturesToFeatureCollection = (wkxFeatures: WKXFeatures): FeatureCollection => ({
  type: 'FeatureCollection',
  features: wkxFeatures.features.map(x => ({
    type: 'Feature',
    properties: {},
    geometry: x.toGeoJSON()
  }))
});
