export * from './components/pluginDetails.component';
export * from './components/pluginsBase.component';
export * from './components/pluginsList.component';

export * from './routes';

import { PluginsDetailComponent } from './components/pluginDetails.component';
import { PluginsBaseComponent } from './components/pluginsBase.component';
import { PluginsListComponent } from './components/pluginsList.component';

export var PLUGINS_COMPONENTS = [
    PluginsBaseComponent,
    PluginsDetailComponent,
    PluginsListComponent
]