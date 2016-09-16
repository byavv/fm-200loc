import {
    FormGroupDirective,
    FormGroup,
    FormControlName,
    FormControl, NgForm
} from '@angular/forms';

import { Component, Directive, Host, Optional, Input, OnInit } from '@angular/core';

@Component({
    selector: 'show-error',
    template: `
        <span class='error-span' *ngIf="errorMessage !== null">{{ errorMessage }}</span>
    `,
    styles: [
        `
        .error-span {
            margin-top: 0rem;
            display: inline-block;
            font-size: 0.9rem;
        }
        `
    ]
})
export class ShowError {
    form: any;
    controlToWatch: any;
    // name of binded form control
    @Input()
    control: string;
    // {'required' : 'field is required', 'customError': 'field value has wrong format'}
    @Input()
    errors: { [code: string]: string; } = {};
    constructor(
        @Host() @Optional() formDir: FormGroupDirective,
        @Host() @Optional() ngForm: NgForm,
        @Host() @Optional() formGroup: FormGroup
    ) {
        if (ngForm) {
            this.form = ngForm;
        }
        if (formDir) {
            this.form = formDir.form;
        }
        if (!this.form) throw new Error('Show-error should be binded to form control');
    }

    get errorMessage(): string {
        this.controlToWatch = this.form.controls[this.control];
        if (this.controlToWatch) {
            for (var error in this.errors) {
                if (this.controlToWatch.hasError(error)) {
                    return this.errors[error]
                }
            }
        }
        return null;
    }
}
