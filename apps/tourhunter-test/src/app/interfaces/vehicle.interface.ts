import { IRoute } from './route.interface';

export interface IVehicle {
  id: number;
  name: string;
  routes: IRoute[];
}
