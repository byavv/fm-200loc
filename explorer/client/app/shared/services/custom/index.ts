/* tslint:disable */
export * from './ApiConfig';
export * from './DriverConfig';
export * from './logger.service';

import { ApiConfigApi } from './ApiConfig';
import { DriverConfigApi } from './DriverConfig';
import { LoggerService } from './logger.service';

export const CUSTOM_SERVICES = [
    ApiConfigApi,
    DriverConfigApi,
    LoggerService
]