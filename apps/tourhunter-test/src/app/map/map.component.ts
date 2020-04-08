import * as R from 'ramda';
import * as L from 'leaflet';
import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { tap, debounceTime } from 'rxjs/operators';
import { untilComponentDestroyed } from 'ng2-rx-componentdestroyed';

import { Coordinate } from '../interfaces';
import { IMarkerPoint } from './marker-point.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'tourhunter-test-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() centrMap: Coordinate;
  @Input() zoomMap: number;
  @Input() points$: Observable<IMarkerPoint[]>;
  @Output() pointHovered = new EventEmitter<IMarkerPoint>();
  private map: any;
  private featureGroup;

  constructor() { }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.map = L.map('mapId').setView(this.centrMap, this.zoomMap);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: `
        Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors,
        <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>
      `,
    }).addTo(this.map);

    this.points$.pipe(
      debounceTime(100),
      tap(points => {
        if(!!this.featureGroup) {
          this.map.removeLayer(this.featureGroup);
        }
        this.featureGroup = L.featureGroup().addTo(this.map);
        R.forEach((point: IMarkerPoint) => L.marker(point.coordinate)
          .addTo(this.featureGroup)
          .bindPopup(`${point.coordinate}`, {closeOnClick: false, autoClose: false})
          .openPopup()
          .on('mouseover', this.touchMarker.bind(this, point)), points);
      }),
      untilComponentDestroyed(this)
    ).subscribe()
  }
  private touchMarker(marker: IMarkerPoint, event) {
    this.pointHovered.emit(marker);
  }

  ngOnDestroy() {}
}
