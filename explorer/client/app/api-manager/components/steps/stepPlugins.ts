import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, Host, ViewChildren, QueryList, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { ShowError } from '../../directives';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Config, Plugin } from '../../../shared/models';
import { BackEnd, AppController } from '../../../shared/services';
import { MasterController } from '../../services/masterController';
import { Observable } from 'rxjs';

import { Subject } from 'rxjs';

@Component({
    selector: 'step-plugins',
    template: require("./templates/stepPlugins.html"),
    styles: [require('./styles/stepPlugins.scss'),
        `
     :host {
        flex:1;
        display: flex;
        flex-direction: column;
    }
    `]
})
export class StepPlugins implements OnInit {
    _apiConfig;
    @Output()
    next: EventEmitter<any> = new EventEmitter();
    activePlugin: Plugin;
    appliedPlugins: Array<Plugin> = [];
    plugins: Array<Plugin> = [];
    loading: boolean;
    submitted: boolean = false;
    selectedPlugin: Plugin;
    showError: boolean = false;

    constructor(
        private master: MasterController,
        fb: FormBuilder,
        private backEnd: BackEnd,
        private appController: AppController) {
    }

    ngOnInit() {
        this.loading = true;
        this.master.error$.subscribe(() => {
            this.showError = true;
        });
        this.appController
            .init$
            .do((defaults) => { this.plugins = defaults.plugins || []; })
            .flatMap(() => this.master.init$)
            .subscribe((apiConfig) => {
                this.loading = false;
                (apiConfig.plugins || []).forEach((cp) => {
                    const plugin = this.plugins.find(plugin => plugin.name === cp.name);
                    if (plugin)
                        this.addNewPlugin(plugin, {// value
                            settings: cp.settings,
                            dependencies: cp.dependencies
                        }, false);
                });
                this.applyPlugins(apiConfig.plugins);
                this.applyValidation();
            });
    }
    /**
     * Add new or configured plugin into list
     */
    addNewPlugin(plugin: Plugin, value: any = {}, apply: boolean = true) {
        var pl = Object.assign({}, plugin);
        let pluginInst = new Plugin(pl, this._lastOrder + 1, value);
        this.appliedPlugins.push(pluginInst);
        this.selectPipeItem(pluginInst);
        if (apply) {
            this.applyValidation();
            this.applyPlugins();
        }
    }

    //# private mathods
    private get _valid(): boolean {
        let valid = true;
        if (this.appliedPlugins && this.appliedPlugins.length > 0) {
            this.appliedPlugins.forEach((plugin) => {
                if (!plugin.valid) {
                    valid = false;
                }
            });
            return valid;
        } else {
            return false;
        }
    }
    private get _lastOrder(): number {
        var lastOrder = 0;
        if (this.appliedPlugins.length > 0) {
            lastOrder = this.appliedPlugins.reduce((prev: Plugin, current: Plugin) => {
                return prev.order < current.order ? current : prev;
            }).order;
        }
        return lastOrder;
    }

    private _sort() {
        this.appliedPlugins.sort((a, b) => {
            return a.order - b.order;
        })
    }

    private _setActive(plugin: Plugin) {
        this.appliedPlugins.map((p) => {
            p.active = false;
        })
        plugin.active = true;
    }

    //# plugin management methods
    applyValidation() {
        this._valid
            ? this.master.setValidity('plugins', true)
            : this.master.setValidity('plugins', false);
    }

    applyPlugins(plugins?: Array<any>) {
        if (!plugins) {
            plugins = this.appliedPlugins.map(p => {
                return {
                    name: p.name,
                    description: p.description,
                    settings: p.value.settings,
                    dependencies: p.value.dependencies
                }
            })
        }
        this.master.config.plugins = plugins;
    }

    selectPipeItem(plugin: Plugin) {
        this.appliedPlugins.forEach((p) => {
            p.active = false;
        })
        plugin.active = true;
        this.activePlugin = plugin;
    }

    //# manage plugin pipe item
    pluginUp(plugin: Plugin) {
        this.selectPipeItem(plugin);
        if (!this.isLast(plugin)) {
            var next = this.appliedPlugins[this.appliedPlugins.indexOf(plugin) + 1];
            plugin.order++;
            next.order--;
            this._sort();
        }
    }

    pluginDown(plugin: Plugin) {
        this.selectPipeItem(plugin);
        if (!this.isFirst(plugin)) {
            var prev = this.appliedPlugins[this.appliedPlugins.indexOf(plugin) - 1];
            plugin.order--;
            prev.order++;
            this._sort();
        }
    }

    pluginDelete(plugin) {
        var index = this.appliedPlugins.indexOf(plugin);
        this.appliedPlugins.splice(index, 1);
        this.applyValidation();
        if (this.appliedPlugins[0])
            this._setActive(this.appliedPlugins[0]);
    }

    isLast(plugin): boolean {
        return (plugin === this.appliedPlugins
            .reduce((prev: Plugin, current: Plugin) => {
                return prev.order < current.order ? current : prev;
            }));
    }

    isFirst(plugin): boolean {
        return (plugin === this.appliedPlugins
            .reduce((prev: Plugin, current: Plugin) => {
                return prev.order > current.order ? current : prev;
            }));
    }

    select(plugin) {
        this.plugins.forEach(plugin => {
            plugin.active = false;
        })
        this.selectedPlugin = plugin;
        this.selectedPlugin.active = true;
    }

    isValid(plugin: Plugin) {
        //  return plugin.valid;
        return false;
    }

    onSubmit() {
        this.submitted = true;
        this.showError = true;
        this.master.setValidity('plugins', this.appliedPlugins.length > 0);
        if (this._valid) {
            this.applyPlugins();
            this.next.next('preview');
        }
    }
}