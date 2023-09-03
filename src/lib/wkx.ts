import type { Geometry as GeoJSONGeometry } from 'geojson';

const wkx = require('wkx');

export type GeoJSONOptions = {
  shortCrs?: boolean;
  longCrs?: boolean;
};

type WKXGeometry = {
  srid: number,
  hasZ: boolean,
  hasM: boolean,
  toWkt: () => string,
  toEwkt: () => string,
  toWkb: () => Buffer,
  toEwkb: () => Buffer,
  toTwkb: () => Buffer,
  toGeoJSON: (options?: GeoJSONOptions) => GeoJSONGeometry
};
type WKXGeometryClass = {
  new(): () => WKXGeometry,
  parse: (value: string | Buffer) => WKXGeometry,
  parseTwkb: (value: Buffer) => WKXGeometry,
  parseGeoJSON: (value: {}) => WKXGeometry
};

type WKXPoint = WKXGeometry & {
  x: number;
  y: number;
  z: number;
  m: number;
};
type WKXPointClass = {
  new(): (x?: number, y?: number, z?: number, m?: number, srid?: number) => WKXPoint,
  Z: (x: number, y: number, z: number, srid?: number) => WKXPoint,
  M: (x: number, y: number, m: number, srid?: number) => WKXPoint,
  ZM: (x: number, y: number, z: number, m: number, srid?: number) => WKXPoint
};

type WKXLineString = WKXGeometry & {
  points: WKXPoint[]
};
type WKXLineStringClass = {
  new(): (points?: WKXPoint[], srid?: number) => WKXLineString,
  Z: (points?: WKXPoint[], srid?: number) => WKXLineString,
  M: (points?: WKXPoint[], srid?: number) => WKXLineString,
  ZM: (points?: WKXPoint[], srid?: number) => WKXLineString
};

type WKXPolygon = WKXGeometry & {
  exteriorRing: WKXPoint[],
  interiorRings: WKXPoint[][]
};
type WKXPolygonClass = {
  new(): (exteriorRing?: WKXPoint[], interiorRings?: WKXPoint[][], srid?: number) => WKXPolygon,
  Z(exteriorRing?: WKXPoint[], interiorRings?: WKXPoint[][], srid?: number): WKXPolygon,
  M(exteriorRing?: WKXPoint[], interiorRings?: WKXPoint[][], srid?: number): WKXPolygon,
  ZM(exteriorRing?: WKXPoint[], interiorRings?: WKXPoint[][], srid?: number): WKXPolygon
};

type WKXMultiPoint = WKXGeometry & {
  points: WKXPoint[]
};
type WKXMultiPointClass = {
  new(): (points?: WKXPoint[], srid?: number) => WKXMultiPoint,
  Z: (points?: WKXPoint[], srid?: number) => WKXMultiPoint,
  M: (points?: WKXPoint[], srid?: number) => WKXMultiPoint,
  ZM: (points?: WKXPoint[], srid?: number) => WKXMultiPoint
};

type WKXMultiLineString = WKXGeometry & {
  lineStrings: WKXLineString[]
};
type WKXMultiLineStringClass = {
  new(): (lineStrings?: WKXLineString[], srid?: number) => WKXMultiLineString,
  Z: (lineStrings?: WKXLineString[], srid?: number) => WKXMultiLineString,
  M: (lineStrings?: WKXLineString[], srid?: number) => WKXMultiLineString,
  ZM: (lineStrings?: WKXLineString[], srid?: number) => WKXMultiLineString
};

type WKXMultiPolygon = WKXGeometry & {
  polygons: WKXPolygon[]
};
type WKXMultiPolygonClass = {
  new(): (polygons?: WKXPolygon[], srid?: number) => WKXMultiPolygon,
  Z: (polygons?: WKXPolygon[], srid?: number) => WKXMultiPolygon,
  M: (polygons?: WKXPolygon[], srid?: number) => WKXMultiPolygon,
  ZM: (polygons?: WKXPolygon[], srid?: number) => WKXMultiPolygon
};

type WKXGeometryCollection = WKXGeometry & {
  geometries: WKXGeometry[]
};
type WKXGeometryCollectionClass = {
  new(): (geometries?: WKXGeometry[], srid?: number) => WKXGeometryCollection;
  Z: (geometries?: WKXGeometry[], srid?: number) => WKXGeometryCollection;
  M: (geometries?: WKXGeometry[], srid?: number) => WKXGeometryCollection;
  ZM: (geometries?: WKXGeometry[], srid?: number) => WKXGeometryCollection;
};

export const Geometry: WKXGeometryClass = wkx.Geometry;
export const Point: WKXPointClass = wkx.Point;
export const LineString: WKXLineStringClass = wkx.LineString;
export const Polygon: WKXPolygonClass = wkx.Polygon;
export const MultiPoint: WKXMultiPointClass = wkx.MultiPoint;
export const MultiLineString: WKXMultiLineStringClass = wkx.MultiLineString;
export const MultiPolygon: WKXMultiPolygonClass = wkx.MultiPolygon;
export const GeometryCollection: WKXGeometryCollectionClass = wkx.GeometryCollection;

export type Geometry = WKXGeometry;
export type Point = WKXPoint;
export type LineString = WKXLineString;
export type Polygon = WKXPolygon;
export type MultiPoint = WKXMultiPoint;
export type MultiLineString = WKXMultiLineString;
export type MultiPolygon = WKXMultiPolygon;
export type GeometryCollection = WKXGeometryCollection;

export default {
  Geometry,
  Point,
  LineString,
  Polygon,
  MultiPoint,
  MultiLineString,
  MultiPolygon,
  GeometryCollection
};
