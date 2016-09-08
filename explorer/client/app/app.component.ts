import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Identity, AppController, Storage } from './shared/services'

import '../assets/styles/main.scss';

@Component({
    selector: 'app',   
    template: `
    <div class="page-wrap">
       <loader [active]='loading' [async]='appController.init$'></loader>      
       <app-header></app-header>
       <div [hidden]='loading' class='container-fluid'>
            <div class='content-area'> 
                <router-outlet>
                </router-outlet>
            </div>
        </div>   
   </div> 
   <app-footer></app-footer>
  `   
})

export class App {
    loading = true;
    constructor(
        private identity: Identity,
        private storage: Storage,
        private appController: AppController,
        public viewContainerRef: ViewContainerRef
    ) {
        this.appController.init$.subscribe(() => {
            this.loading = false;
        })
        this.appController.start();
        identity.update(JSON.parse(storage.getItem("authorizationData")));
    }
}
