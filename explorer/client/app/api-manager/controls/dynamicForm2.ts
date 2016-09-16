import {
    Component, Input,
    Output, OnInit,
    EventEmitter, forwardRef
} from '@angular/core';
import {
    FormGroup,
    Validators, FormBuilder
} from '@angular/forms';
import {
    NgControl, NgModel,
    ControlValueAccessor, NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
    selector: 'dynamic-form2',
    template: require('./templates/dynamicForm.html'),
    exportAs: 'dynForm',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DynamicForm2),
            multi: true
        }
    ]
})
export class DynamicForm2 implements ControlValueAccessor {
    private _fields = [];
    @Input()
    set fields(value: any) {
        let group = {};
        if (value) {
            this._fields.slice(0, this._fields.length);

            Object.keys(value).forEach((key: any) => {
                group[key] = value[key].required
                    ? ['', Validators.required]
                    : [''];
                this._fields.push({
                    key: key,
                    value: '',
                    label: value[key].label,
                    helpString: value[key].help,
                    type: value[key].type ? value[key].type : 'string',
                    options: value[key].options ? value[key].options : [], // if property is array
                });
            });

            this.form = this._builder.group(group);
            this.form.valueChanges
                .subscribe(value => {
                    this.onChange.next(value);
                });
        }
    }

    form: FormGroup = this._builder.group({});
    constructor(private _builder: FormBuilder) { }

    get fields() {
        return this._fields;
    }
    get valid(){
        return this.form? this.form.valid: false;
    }

    /**
     * ControlValueAccessor members
     */
    onTouched = () => {
    };
    @Output()
    onChange: EventEmitter<any> = new EventEmitter();
    writeValue(value) {
        if (value !== undefined) {
            for (const key in value) {
                const field = this.fields.find((field) => field.key === key);
                if (field) {
                    field.value = value[key];
                }
            }
        }
    }
    registerOnChange(fn): void {
        this.onChange.subscribe(fn);

    }
    registerOnTouched(fn): void {
        this.onTouched = fn;
    }
}
