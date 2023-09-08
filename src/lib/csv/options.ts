export type CSVGeneralOptions = {
  delimiter: string,
  minColumn?: number
};

export type CSVGeometryModeNone = 'none';
export type CSVGeometryModeXY = 'xy';
export type CSVGeometryModeText = 'geojson' | 'wkt';
export type CSVGeometryModeBinary = 'wkb';
export type CSVGeometryModeAuto = 'auto';
export type CSVSingleGeometryModes = CSVGeometryModeText | CSVGeometryModeBinary | CSVGeometryModeAuto;
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

export type CSVGeometryBinaryOptions = {
  mode: CSVGeometryModeBinary,
  encoding: CSVGeometryBinaryEncoding,
  columnName: string
};

export type CSVGeometryAutoOptions = {
  mode: CSVGeometryModeAuto,
  columnName: string
};

export type CSVGeometryOptions = CSVNoneGeometry | CSVGeometryXYOptions | CSVGeometryTextOptions | CSVGeometryBinaryOptions | CSVGeometryAutoOptions;

export type CSVOptions<T extends CSVGeometryOptions = CSVGeometryOptions> = CSVGeneralOptions & {
  geometry: T
};

export const getDefaultCSVOptions = (): CSVOptions => ({ delimiter: ',', geometry: { mode: 'none' } });
