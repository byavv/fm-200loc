import { Routes } from '@angular/router';
import {
    DriverManagerBaseComponent,
    DriverManagerListComponent,
    DriverManagerConfigComponent,
    DriverTypesComponent
} from './';

export const DriverManagerRoutes: Routes = [
    {
        path: 'drivers',
        component: DriverManagerBaseComponent,
        children: [
         //  {
        //        path: 'list',
        //        component: DriverManagerListComponent
        //    },
            {
                path: 'config',
                component: DriverManagerConfigComponent
            },
            {
                path: '',
                component: DriverTypesComponent
            }
        ]
    }
];
