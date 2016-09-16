import { Injectable, NgZone } from '@angular/core';
import { Http, Response } from '@angular/http';

import { BackEnd } from "./backEndApi";
import { ReplaySubject, Observable } from "rxjs";

@Injectable()
export class AppController {
    init$: ReplaySubject<any> = new ReplaySubject<any>();

    constructor(private _backEnd: BackEnd, private _ngZone: NgZone) { }

    start() {
        this._ngZone.runOutsideAngular(() => {
            this._loadAppDefaults((defaults) => {
                this._ngZone.run(() => {
                    this.init$.next(defaults);
                });
                console.log("APPLICATION STARTED");
            })
        });
    }

    _loadAppDefaults(doneCallback: (defaults: any) => void) {
        Observable.zip(
            this._backEnd.getPlugins(),
            (plugins) => [plugins])
            .subscribe(value => {
                doneCallback({
                    plugins: value[0]
                });
            }, err => {
                console.log(err);
            })
    }
}
