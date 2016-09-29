import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, Host, Optional } from '@angular/core';
import { Router, ActivatedRoute} from "@angular/router";
import { ShowError } from '../../directives/showError';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Config } from '../../../shared/models';
import {BackEnd, AppController } from '../../../shared/services';
import {MasterController } from '../../services/masterController';
import {Observable } from 'rxjs';

@Component({
    selector: 'step-preview',
    template: require("./templates/stepPreview.html"),
    styles: [require('./styles/stepPreview.scss'),
        `
     :host {
        flex:1;
        display: flex;
        flex-direction: column;
    }
    `]
})
export class StepPreview implements OnInit {
    @Output()
    next: EventEmitter<any> = new EventEmitter();
    loading: boolean = false;
    submitted: boolean = false;
    constructor(
        private master: MasterController,
        fb: FormBuilder,
        private backEnd: BackEnd,
        private appController: AppController) {
    }

    ngOnInit() {
    }

    onSubmit() {
        this.next.next("Done")
    }
}