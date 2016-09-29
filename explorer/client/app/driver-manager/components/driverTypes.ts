import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackEnd } from '../../shared/services';

@Component({
    template: require('./templates/driverTypes.tmpl.html'),
    styles: [require('./styles/driverTypes.scss')]
})
export class DriverTypesComponent implements OnInit {
    drivers: Array<any> = [];

    constructor(
        private router: Router,
        private backEnd: BackEnd) { }

    ngOnInit() {
        this.backEnd.getAvailableDrivers()
            .subscribe((drivers) => {
                this.drivers = drivers;
            })
    }
}
