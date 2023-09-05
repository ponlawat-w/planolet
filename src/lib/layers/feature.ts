import { AppMapLayerType, type AppMapLayer } from './default';
import { FeatureGroup, LatLng, geoJSON, type Layer, CircleMarker } from 'leaflet';
import type { AppObjectLayer } from './object';
import type { Feature, FeatureCollection, GeoJSON, Geometry, GeometryObject, MultiPoint, Point } from 'geojson';
import { wkxFeaturesToFeatureCollection, type WKXFeatures, rawIsWKX, rawWKXToData, appFeatureLayerDataIsWKX, wkxFeaturesGetGeometryType, wkxGetFeaturesCount } from './feature-wkx';
import { appFeatureLayerDataIsGeoJSON, geoJSONDataToFeatureCollection, geoJSONGetFeaturesCount, geoJSONGetGeometryType, rawGeoJSONToData, rawIsGeoJSON } from './feature-geojson';

const getPointCircle = (coordinates: number[]): Layer => new CircleMarker(
  new LatLng(coordinates[1], coordinates[0]), {
    fill: true,
    fillColor: '#ff0000',
    radius: 4,
    stroke: false,
    fillOpacity: 1
  }
);

const geometryToLayers = (geometry: GeometryObject): Layer[] => {
  if (geometry.type === 'Point') {
    return [getPointCircle(geometry.coordinates)];
  }
  if (geometry.type === 'MultiPoint') {
    return geometry.coordinates.map(x => getPointCircle(x));
  }
  if (geometry.type === 'GeometryCollection') {
    return geometry.geometries.map(x => geometryToLayers(x)).flat();
  }
  return [geoJSON(geometry)];
};

const getLeafletLayerFromFeatureCollection = (featureCollection: FeatureCollection): Layer => {
  const layers: Layer[] = [];
  for (const feature of featureCollection.features) {
    layers.push(...geometryToLayers(feature.geometry));
  }
  return new FeatureGroup(layers);
};

export enum AppFeatureLayerDataType {
  GeoJSON, WKT, WKBHex, WKBBase64, Unknown
};

export type AppFeatureLayerData = FeatureCollection|Feature|Geometry|WKXFeatures;

export type AppFeatureLayerOptions = {
  url?: string,
  data: AppFeatureLayerData
};

export type AppFeatureLayer = AppMapLayer & {
  type: AppMapLayerType.FeatureLayer,
  options: AppFeatureLayerOptions
};

export const rawToAppFeatureLayerType = (raw: string): AppFeatureLayerDataType => {
  if (rawIsGeoJSON(raw)) return AppFeatureLayerDataType.GeoJSON;
  if (rawIsWKX(raw)) return AppFeatureLayerDataType.WKT;
  return AppFeatureLayerDataType.Unknown;
};

export const rawToAppFeatureLayerData = (raw: string): AppFeatureLayerData => {
  if (rawIsGeoJSON(raw)) return rawGeoJSONToData(raw);
  if (rawIsWKX(raw)) return rawWKXToData(raw);
  throw new Error('Unable to interpret input data');
};

export const getGeometryType = (layer: AppFeatureLayer): string => {
  if (!layer || !layer.options.data) {
    return 'Empty';
  }
  if (appFeatureLayerDataIsGeoJSON(layer.options.data)) { return geoJSONGetGeometryType(layer.options.data as GeoJSON); }
  if (appFeatureLayerDataIsWKX(layer.options.data)) { return wkxFeaturesGetGeometryType(layer.options.data as WKXFeatures); }
  return 'Unknown Type'
};

export const getFeaturesCount = (layer: AppFeatureLayer): number => {
  if (!layer || !layer.options.data) {
    return 0;
  }
  if (appFeatureLayerDataIsGeoJSON(layer.options.data)) { return geoJSONGetFeaturesCount(layer.options.data as GeoJSON); }
  if (appFeatureLayerDataIsWKX(layer.options.data)) { return wkxGetFeaturesCount(layer.options.data as WKXFeatures); }
  return 0;
};

const getFeatureCollectionFromObject = (data: AppFeatureLayerData): FeatureCollection => {
  if (!data.type) throw new Error('Property type is required in the object');
  if (appFeatureLayerDataIsGeoJSON(data)) { return geoJSONDataToFeatureCollection(data as GeoJSON); }
  if (appFeatureLayerDataIsWKX(data)) { return wkxFeaturesToFeatureCollection(data as WKXFeatures); }
  throw new Error(`Unknown GeoJSON type ${(data as any).type}`);
};

export const createFeatureLayer = (name: string, data: AppFeatureLayerData, url?: string): AppObjectLayer => ({
  name,
  type: AppMapLayerType.FeatureLayer,
  visible: true,
  leafletLayer: getLeafletLayerFromFeatureCollection(
    getFeatureCollectionFromObject(data)
  ),
  options: { data, url }
});
