import { Component, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { FirstUpPipe } from '../pipes';
import { ShowError } from '../directives';
@Component({
  selector: 'option-input',
  template: require('./templates/optionInput.html')
})
export class OptionInput {
  @Input() field: any;
  @Input() form: FormGroup;

  get isValid() {
    return this.form.controls[this.field.key].valid;
  }
}