/* tslint:disable */
export * from './auth.service';
export * from './error.service';
export * from './search.params';
export * from './base.service';

import { LoopBackAuth } from './auth.service';
import { ErrorHandler } from './error.service';
import { JSONSearchParams } from './search.params';
import { BaseLoopBackApi } from './base.service';

export const CORE_SERVICES = [
    LoopBackAuth, ErrorHandler, JSONSearchParams
]
