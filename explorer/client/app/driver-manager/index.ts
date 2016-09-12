import { DriverManagerBaseComponent } from './components/driverManagerBase';
import { DriverManagerConfigComponent } from './components/driverManagerConfig';
//import { DriverManagerListComponent } from './components/driverManagerList';
import { DriverTypesComponent } from './components/driverTypes';

export * from './components/driverManagerBase';
export * from './components/driverManagerConfig';
//export * from './components/driverManagerList';
export * from './components/driverTypes';

export * from './routes';

export var DRIVER_MNGR_COMPONENTS = [
    DriverManagerBaseComponent,
    DriverManagerConfigComponent,
  //  DriverManagerListComponent,
    DriverTypesComponent
]