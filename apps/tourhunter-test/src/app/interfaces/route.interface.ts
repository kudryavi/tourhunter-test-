import { IRouteStop } from './route-stop.interface';

export interface IRoute {
  id: number;
  name: string;
  stops: IRouteStop[];
}
