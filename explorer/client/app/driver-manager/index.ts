import { DriverManagerBaseComponent } from './components/driverManagerBase';
import { DriverManagerConfigComponent } from './components/driverManagerConfigList';
import { DriverTypesComponent } from './components/driverTypes';

export * from './components/driverManagerBase';
export * from './components/driverManagerConfigList';
export * from './components/driverTypes';

export * from './routes';

export var DRIVER_MNGR_COMPONENTS = [
  DriverManagerBaseComponent,
  DriverManagerConfigComponent,
  DriverTypesComponent
]
