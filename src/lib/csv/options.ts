export type CSVGeneralOptions = {
  delimiter: string
};

export type CSVGeometryModeNone = 'none';
export type CSVGeometryModeXY = 'xy';
export type CSVGeometryModeText = 'geojson' | 'wkt';
export type CSVGeometryModeBinary = 'wkb';
export type CSVSingleGeometryModes = CSVGeometryModeText | CSVGeometryModeBinary;
export type CSVGeometryMode = CSVGeometryModeNone | CSVGeometryModeXY | CSVSingleGeometryModes;

export type CSVGeometryBinaryEncoding = 'hex' | 'base64';

export type CSVNoneGeometry = {
  mode: CSVGeometryModeNone
};

export type CSVGeometryXYOptions = {
  mode: CSVGeometryModeXY,
  xColumn: string,
  yColumn: string
};

export type CSVGeometryTextOptions = {
  mode: CSVGeometryModeText,
  columnName: string
};

export type CSVGeomtryBinaryOptions = {
  mode: CSVGeometryModeBinary,
  encoding: CSVGeometryBinaryEncoding,
  columnName: string
};

export type CSVGeometryOptions = CSVNoneGeometry | CSVGeometryXYOptions | CSVGeometryTextOptions | CSVGeomtryBinaryOptions;

export type CSVOptions = CSVGeneralOptions & {
  geometry: CSVGeometryOptions
};

export const getDefaultCSVOptions = (): CSVOptions => ({ delimiter: ',', geometry: { mode: 'none' } });
