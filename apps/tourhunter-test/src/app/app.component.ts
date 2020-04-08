import * as R from 'ramda';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { merge, Observable, combineLatest } from 'rxjs';
import { tap, map, debounceTime } from 'rxjs/operators';
import { untilComponentDestroyed } from 'ng2-rx-componentdestroyed';

import { IVehicle, IRoute, IRouteStop, Coordinate } from './interfaces';
import { VehiclesService } from './services';
import { transformer } from './utils.const';
import { IMarkerPoint } from './map/marker-point.interface';

interface VehicleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}
@Component({
  selector: 'tourhunter-test-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public centrMap: Coordinate = [53.9006, 27.5590];
  public zoomMap = 13;
  public indent = '20px';
  public points$: Observable<IMarkerPoint[]> = this.vehiclesService.stopsSelected$.pipe(
    map(R.map(stop => ({coordinate: stop.coordinate, payload: stop}))),
  );
  private vehicles: IVehicle[];
  private routes: IRoute[];
  private stops: IRouteStop[];
  public idsStops$: Observable<{}> = combineLatest(
    [this.vehiclesService.stopsSelected$, this.vehiclesService.stopsTouched$]
    ).pipe(
      map(R.flatten),
      map(R.map(R.prop('id'))),
      map(ids => {
        const obj = {};
        R.map(id => obj[id] = true, ids);
        return obj;
      })
  );
  public touchedStops: Observable<IRouteStop[]>;
  public treeControl = new FlatTreeControl<VehicleFlatNode>(node => node.level, node => node.expandable);
  public treeFlattener = new MatTreeFlattener(transformer, node => node.level, node => node.expandable, (node: any) => node.routes || node.stops);
  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  public hasChild = (_: number, node: VehicleFlatNode) => node.expandable;

  constructor(
    private vehiclesService: VehiclesService
  ) {}

  ngOnInit() {
    const loadVehicles$ = this.vehiclesService.loadVehicles();
    const vehicles$ = this.vehiclesService.vehicles$.pipe(
      tap(vehicles => {
        this.vehicles = vehicles;
        this.routes = R.compose(
          R.flatten,
          R.map(R.prop('routes'))
        )(vehicles);
        this.stops = R.compose(
          R.flatten,
          R.map(R.prop('stops'))
        )(this.routes);
        this.dataSource.data = vehicles;
        this.treeControl.expandAll();
      })
    );
    this.touchedStops = this.vehiclesService.stopsTouched$.pipe(
      debounceTime(100)
    );
    merge(loadVehicles$, vehicles$).pipe(
      untilComponentDestroyed(this)
    ).subscribe()
  }

  public selectStops(node) {
    const equalsNodeId = R.compose(
      R.equals(node.id),
      R.prop('id')
    );
    const toStops = R.prop('stops');
    let stops = [];
    switch(node.level) {
      // we get all stops related to a specific type of vehicle
      case 0:
        const touchedVehicle = R.find(equalsNodeId, this.vehicles);
        stops = R.compose(
          R.flatten,
          R.map(toStops),
          R.prop('routes')
        )(touchedVehicle);
        break;
      // we get all stops related to a specific route
      case 1:
        const touchedRoute = R.find(equalsNodeId, this.routes);
        stops = toStops(touchedRoute);
        break;
      // we get the click stop
      case 2:
        stops = R.find(equalsNodeId, this.stops);
        break;
    }
    this.vehiclesService.addStopsSelected(stops);
  }

  public deleteStop(stop: IRouteStop) {
    this.vehiclesService.deleteTouchedStops(stop);
  }

  public deleteMarkerFromMap(marker: IMarkerPoint) {
    this.vehiclesService.deleteStopsSelected(marker.payload);
    this.vehiclesService.addTouchedStops(marker.payload);
  }

  trackByFn(index, item) {
    return item.id;
 }

  ngOnDestroy() {}
}
