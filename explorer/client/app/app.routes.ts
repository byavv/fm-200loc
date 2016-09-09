import { Routes } from '@angular/router';
import { ApiManagerRoutes } from './api-manager';
import { AuthenticationRoutes } from './authentication';
import { PluginsRoutes } from './plugin-manager';

export const routes: Routes = [
    ...PluginsRoutes,
    ...ApiManagerRoutes,
    ...AuthenticationRoutes
];
