import { ApiManagementComponent } from './components/apiManager.component';
import { ApiListComponent } from './components/apiList.component';
import { ApiMasterComponent } from './components/apiMaster.component';

import { MASTER_STEPS_COMPONENTS } from './components/steps';

import { API_MANAGER_DIRECTIVES } from './directives';
import { API_MANAGER_CONTROLS } from './controls';
import { API_MANAGER_PIPES } from './pipes'

export * from './components/apiManager.component';
export * from './components/apiList.component';
export * from './components/apiMaster.component';
export * from './routes';

export var API_MNGR_COMPONENTS = [
    ApiManagementComponent,
    ApiListComponent,
    ApiMasterComponent,
    ...MASTER_STEPS_COMPONENTS,
    ...API_MANAGER_DIRECTIVES,
    ...API_MANAGER_PIPES,
    ...API_MANAGER_CONTROLS
]