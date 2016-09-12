import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Identity, AppController, Storage } from './shared/services'

import '../assets/styles/main.scss';

@Component({
    selector: 'app',
    template: require('./app.component.tmpl.html')
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
