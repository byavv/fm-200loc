import { Routes } from '@angular/router';
import { ApiManagementComponent, ApiListComponent, ApiMasterComponent } from './';

export const ApiManagerRoutes: Routes = [
  {
    path: '',
    component: ApiManagementComponent,
    children: [
      {
        path: 'master',
        component: ApiMasterComponent
      },
      {
        path: '',
        component: ApiListComponent
      }
    ]
  }
];
