import * as R from 'ramda';
import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { IVehicle, IRouteStop } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
  private vehiclesState = new BehaviorSubject<IVehicle[]>([]);
  private selectedStopsState = new BehaviorSubject<IRouteStop[]>([]);
  private touchedStopsState = new BehaviorSubject<IRouteStop[]>([]);

  get vehicles$() {
    return this.vehiclesState.asObservable();
  }
  get stopsSelected$() {
    return this.selectedStopsState.asObservable();
  }
  get stopsTouched$() {
    return this.touchedStopsState.asObservable();
  }

  constructor(
    private http: HttpClient
  ) {}

  public loadVehicles(): Observable<IVehicle[]> {
    return this.http.get<IVehicle[]>('/api/vehicles').pipe(
      tap(vehicles => this.vehiclesState.next(vehicles))
    );
  }
  public addStopsSelected(stops: IRouteStop[]) {
    const stateStopsTouched = this.touchedStopsState.getValue();
    const newStateStops = R.filter(
      stop => R.not(
        R.find(
          (stopTouched) => R.equals(R.prop('id', stopTouched), stop.id),
          stateStopsTouched
        )
      ), stops
    );
    return this.selectedStopsState.next(newStateStops);
  }
  public deleteStopsSelected(stop: IRouteStop) {
    const stateStops = this.selectedStopsState.getValue();
    const newStateStops = R.filter(
      R.compose(
        R.not,
        R.equals(stop.id),
        R.prop('id')
      ), stateStops
    );
    return this.selectedStopsState.next(newStateStops);
  }
  public addTouchedStops(stop: IRouteStop) {
    const stateTouchedStops = this.touchedStopsState.getValue();
    const newStateTouchedStops = R.concat(stateTouchedStops, [stop]);
    return this.touchedStopsState.next(newStateTouchedStops);
  }
  public deleteTouchedStops(stop: IRouteStop) {
    const stateTouchedStops = this.touchedStopsState.getValue();
    const newStateTouchedStops = R.filter(
      R.compose(
        R.not,
        R.equals(stop.id),
        R.prop('id')
      ), stateTouchedStops
    );
    return this.touchedStopsState.next(newStateTouchedStops);
  }
}
