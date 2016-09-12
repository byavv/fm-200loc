import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BackEnd } from '../../shared/services';
import { Plugin } from '../../shared/models';

@Component({
    template: require('./templates/driverManagerConfig.tmpl.html')
})
export class DriverManagerConfigComponent {
    plugin: Plugin;
    driverConfigs: Array<any> = [];
    constructor(
        private activeRoute: ActivatedRoute,
        private backEnd: BackEnd
    ) { }

    ngOnInit() {
        this.backEnd
            .getDriverConfigByName(this.activeRoute.snapshot.queryParams['name'])
            .subscribe(driverConfigs => {
                console.log(driverConfigs)
                this.driverConfigs = driverConfigs;
            })
        this.backEnd
            .getDriverTemplateByName(this.activeRoute.snapshot.queryParams['name'])
            .subscribe((pl) => {
                this.plugin = new Plugin(pl.name, pl.description, 0, pl.settings, {});
                //this.plugin = Object.assign({}, this.plugin, config);
            });

    }
    //# plugin management methods
    applyValidation() {
        // this._valid
        //     ? this.master.setValidity('plugins', true)
        //     : this.master.setValidity('plugins', false);
    }
    addOrUpdate(value) {
        if (value) {


            const temp = Object.assign({}, value);
            delete temp.form;
            this.backEnd.createOrUpdateDriver(temp)
                .subscribe((result) => {
                    console.log(result)
                });


        } else {

        }

    }
}