import {
    Component, Input,
    Output, OnInit,
    EventEmitter, ViewChild
} from '@angular/core';
import {
    FormGroup, FormArray,
    Validators, FormBuilder,
    FormControl
} from '@angular/forms';
import { Observable } from 'rxjs';
import { DynamicForm2 } from './';
import { Plugin, DriverConfig } from '../../shared/models';
import { DriverConfigApi } from '../../shared/services';

@Component({
    selector: 'plugin-form',
    template: require('./templates/pluginSettingsForm.html')
})
export class PluginSettings {
    form: FormGroup;
    pluginTemplate: any;
    dependenciesTemplate: any;
    deps: Array<any>;
    settingsValue: any;
    dependenciesValue: any = {};
    driverConfigs: any = {};

    @ViewChild('settingsForm') settForm: DynamicForm2;
    @ViewChild('dependenciesForm') depsForm: DynamicForm2;

    private _plugin;
    @Input()
    set plugin(pl: Plugin) {
        this._plugin = pl;
        // set template for plugin settings
        this.pluginTemplate = pl.settingsTemplate;
        // set config and find available options for required driver
        let fromDependencies = Observable
            .from([...pl.dependenciesTemplate || []])
        Observable.zip(
            // save key
            fromDependencies
                .map((dep) => dep),
            // find driver configs to fill select options
            fromDependencies
                .flatMap((dep) => this.driverConfigApi
                    .find({ where: { driverId: dep } })),
            // turn required driver name as string into dynamic-form2 format
            fromDependencies
                .reduce((fields, v) => {
                    fields[v] = {
                        required: true,
                        label: v,
                        help: `${v} configuration`,
                        type: "array"
                    }
                    return fields;
                }, {}), (key, options, template) => {
                    template[key].options = options;
                    return template;
                }).subscribe(result => {
                    this.dependenciesTemplate = result;
                    this.dependenciesValue = pl.value ? pl.value.dependencies : {};
                });
        this.settingsValue = pl.value ? pl.value.settings : {};
    }
    get plugin() {
        return this._plugin;
    }

    constructor(private _builder: FormBuilder, private driverConfigApi: DriverConfigApi) {
        this.form = this._builder.group({
            settings: [],
            dependencies: []
        });
    }

    ngAfterViewInit() {
        this.form
            .valueChanges
            .subscribe((value) => {
                this.plugin.valid = this.settForm.valid && this.depsForm.valid;
                this.plugin.value = value;              
                this.changed.emit(value);
            });
        this.plugin.valid = this.settForm.valid && this.depsForm.valid;
    }

    @Output()
    changed: EventEmitter<any> = new EventEmitter();
}
