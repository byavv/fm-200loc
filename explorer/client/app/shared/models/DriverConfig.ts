/* tslint:disable */

export interface DriverConfigInterface {
  name: string;
  description?: string;
  settings?: any;
  driverId?: string;
  id?: number;
}

export class DriverConfig implements DriverConfigInterface {
  name: string;
  description: string;
  settings: any;
  driverId: string;
  id: number;
  constructor(instance?: DriverConfig) {
    Object.assign(this, instance);
  }
}
