import { BackEnd } from './backEndApi';
import { AppController } from './appController';

import { CORE_SERVICES } from './core/index';
import { CUSTOM_SERVICES } from './custom/index';

export * from './backEndApi';
export * from './appController';

export * from './core/index';
export * from './custom/index';

export var SHARED_SERVICES: Array<any> = [  
    BackEnd,
    AppController,   
    ...CORE_SERVICES,
    ...CUSTOM_SERVICES
];
