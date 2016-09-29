/*
 * Angular bootstraping
 */
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ApplicationRef } from '@angular/core';

/*
 * App Module
 * our top level module that holds all of our components
 */
import { AppModule } from './app.module';

/*
 * Bootstrap our Angular app with a top level NgModule
 */
//platformBrowserDynamic().bootstrapModule(AppModule);
export function main(): Promise<any> {
  return platformBrowserDynamic()
    .bootstrapModule(AppModule)   
    .catch(err => console.error(err));
}
main();
