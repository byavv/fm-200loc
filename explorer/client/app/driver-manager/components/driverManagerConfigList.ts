import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BackEnd } from '../../shared/services';
import { Plugin } from '../../shared/models';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';

@Component({
    template: require('./templates/driverManagerConfigList.tmpl.html')
})
export class DriverManagerConfigComponent {
    plugin: Plugin;
    driverConfigs: Array<any> = [];
    currentSettings = {};
    currentDriver = {};
    @ViewChild('lgModal') modal: ModalDirective;
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
            });
    }

    applyValidation() { }

    addOrUpdate() {
        let temp = Object.assign({}, this.plugin);
        temp.settings = this.currentSettings;
        delete this.plugin.form;
        this.backEnd
            .createOrUpdateDriver(temp)
            .subscribe((result) => {
                console.log(result)
            });

    }
    editConfig(config) {
        //config.id
        console.log(config)
    }
    deleteConfig(config) {

    }
    showModal(id?: string) {
        if (id) {
            this.backEnd
                .getDriverConfig(id)
                .subscribe((driver) => {
                    this.currentSettings = driver.settings;
                });

            this.modal.show();
        } else {
            var temp = {}
            for (const key in this.plugin.settings) {
                temp[key] = this.plugin.settings[key].default || ''
            }
            this.currentSettings = temp;
            this.modal.show();
        }
    }
    hideModal() {
        this.modal.hide();
        this.currentSettings = {};
    }
}