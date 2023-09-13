import { Polyline, type LeafletMouseEvent } from 'leaflet';
import type { EditPoint } from './point';
import type { LineString } from 'geojson';

export class EditPath extends Polyline {
  protected _points: EditPoint[];

  public constructor(points: EditPoint[]) {
    super(points.map(x => x.getLatLng()));
    this._points = points;
    this.addDefaultListeners();
  }

  private updateLatLngs() {
    this.setLatLngs(this._points.map(x => x.getLatLng()));
  }

  private removePoint(point: EditPoint) {
    this._points = this._points.filter(x => x !== point);
    this.disposePoint(point);
    this.updateLatLngs();
    point.remove();
  }

  private pointClicked(event: LeafletMouseEvent, point: EditPoint) {}

  private addDefaultListeners() {
    for (const point of this._points) {
      if (!point.hasEventListeners('move')) {
        point.addEventListener('move', () => { this.updateLatLngs(); });
      }

      if (!point.hasEventListeners('click')) {
        point.addEventListener('click', e => { this.pointClicked(e, point); });
      }
    }
  }

  private disposePoint(point: EditPoint) {
    point.removeEventListener('move');
    point.removeEventListener('click');
  }

  public getGeometry(): LineString {
    return { 'type': 'LineString', coordinates: this._points.map(x => x.getCoordinates()) };
  }

  public remove(): this {
    for (const point of this._points) this.disposePoint(point);
    return super.remove();
  }
}
