import { IVehicle, IRoute, IRouteStop } from "./interfaces";

export const transformer = (node: IVehicle | IRoute | IRouteStop, level: number) => {
  return {
    expandable: level !== 2,
    name: node.name,
    level: level,
    id: node.id
  };
};
