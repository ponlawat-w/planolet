import { Buffer } from 'buffer';
import { Geometry } from '../wkx';
import type { AppFeatureLayerData } from './feature';
import type { FeatureCollection, GeometryObject } from 'geojson';

export type WKTFeature = {
  type: 'WKT',
  data: string
};

export type WKBFeature = {
  type: 'WKB',
  encoding: 'hex'|'base64',
  data: Uint8Array
};

export type WKXFeature = WKTFeature|WKBFeature;

export type WKXFeatures = {
  type: 'WKX',
  features: WKXFeature[]
};

export const appFeatureLayerDataIsWKX = (data: AppFeatureLayerData): boolean => data.type && data.type === 'WKX';

export const rawIsWKX = (raw: string): boolean => {
  try {
    return (rawWKXToData(raw) as WKXFeatures).features.length > 0;
  } catch { return false; }
};

const strToWKT = (str: string): WKTFeature|undefined => {
  try {
    Geometry.parse(str);
    return { type: 'WKT', data: str };
  } catch { return undefined; }
};
const strToHexWKB = (str: string): WKBFeature|undefined => {
  try {
    const bytes = Uint8Array.from(str.match(/.{1,2}/g).map(x => parseInt(x, 16)));
    Geometry.parse(Buffer.from(bytes));
    return { type: 'WKB', encoding: 'hex', data: bytes };
  } catch { return undefined; }
};
const strToBase64WKB = (str: string): WKBFeature|undefined => {
  try {
    const bytes = Uint8Array.from(atob(str), x => x.charCodeAt(0));
    Geometry.parse(Buffer.from(bytes));
    return { type: 'WKB', encoding: 'base64', data: bytes };
  } catch { return undefined; }
};

export const rawWKXToFeature = (raw: string): WKXFeature => {
  let feature: WKXFeature = strToWKT(raw);
  if (feature) return feature;
  feature = strToHexWKB(raw);
  if (feature) return feature;
  feature = strToBase64WKB(raw);
  if (feature) return feature;
  throw new Error(`Unable to interpret line data: ${raw}`);
};

export const rawWKXToData = (raw: string): AppFeatureLayerData => ({
  type: 'WKX',
  features: raw.split('\n').map(x => x.trim()).filter(x => x).map(x => rawWKXToFeature(x))
});

export const wkxFeatureToGeoJSONGeometry = (feature: WKXFeature): GeometryObject => {
  switch (feature.type) {
    case 'WKT': return Geometry.parse(feature.data).toGeoJSON();
    case 'WKB': return Geometry.parse(Buffer.from(feature.data)).toGeoJSON();
  }
};

export const wkxFeaturesGetGeometryType = (data: WKXFeatures): string => {
  let type: string;
  for (const feature of data.features) {
    const featureType = wkxFeatureToGeoJSONGeometry(feature).type;
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
    geometry: wkxFeatureToGeoJSONGeometry(x)
  }))
});
