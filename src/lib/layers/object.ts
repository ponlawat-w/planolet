import type { Layer } from 'leaflet';
import { AppMapLayer } from './map-layer';

export class AppObjectLayer<T extends Layer = Layer> extends AppMapLayer<T> {};
