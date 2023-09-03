import type { FeatureCollection } from 'geojson';
import type { AppFeatureLayerData } from './feature';

export const appFeatureLayerDataIsGeoJSON = (data: AppFeatureLayerData): boolean => data.type && (
  data.type === 'FeatureCollection'
  || data.type === 'Feature'
  || data.type === 'Point'
  || data.type === 'MultiPoint'
  || data.type === 'LineString'
  || data.type === 'MultiLineString'
  || data.type === 'Polygon'
  || data.type === 'MultiPolygon'
  || data.type === 'GeometryCollection'
);

export const rawIsGeoJSON = (raw: string): boolean => {
  try {
    const data = JSON.parse(raw);
    if (!data.type) return false;
    return appFeatureLayerDataIsGeoJSON(data);
  } catch { return false; }
};

export const rawGeoJSONToData = (raw: string): AppFeatureLayerData => JSON.parse(raw);

export const geoJSONGetGeometryType = (data: AppFeatureLayerData): string => {
  if (data.type === 'FeatureCollection') {
    let type: string;
    for (const feature of data.features) {
      if (type && feature.geometry.type !== type) {
        return 'Mixed Feature Collection';
      }
      type = feature.geometry.type;
    }
    return `${type ?? 'Empty'} Feature Collection`;
  }
  if (data.type === 'Feature') {
    return `Single ${data.geometry.type} Feature`;
  }
  if (data.type) {
    return `Single ${data.type} Geometry`;
  }
  return 'Unknown';
};

export const geoJSONGetFeaturesCount = (data: AppFeatureLayerData) => data.type === 'FeatureCollection' ? data.features.length : 1;

export const geoJSONDataToFeatureCollection = (data: AppFeatureLayerData): FeatureCollection => {
  if (data.type === 'FeatureCollection') return data;
  if (data.type === 'Feature') return { type: 'FeatureCollection', features: [data] };
  if (
    data.type === 'Point'
    || data.type === 'MultiPoint'
    || data.type === 'LineString'
    || data.type === 'MultiLineString'
    || data.type === 'Polygon'
    || data.type === 'MultiPolygon'
    || data.type === 'GeometryCollection'
  ) return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: data,
      properties: {}
    }]
  };
  throw new Error('Data is not GeoJSON');
};
