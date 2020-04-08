export interface IRouteStop {
  id: number;
  name: string;
  coordinate: Coordinate;
}

export type Coordinate = [number, number];
