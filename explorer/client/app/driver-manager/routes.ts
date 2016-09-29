import { Routes } from '@angular/router';
import {
    DriverManagerBaseComponent,
    DriverManagerConfigComponent,
    DriverTypesComponent
} from './';

export const DriverManagerRoutes: Routes = [
    {
        path: 'drivers',
        component: DriverManagerBaseComponent,
        children: [
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
