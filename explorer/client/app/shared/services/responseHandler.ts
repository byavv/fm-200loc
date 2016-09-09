import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router';
//let messageKeys = require('../../../../shared/index').keys;
import { Identity } from './identity';
import { Storage } from './storage';

@Injectable()
export class ResponseHandler {
    constructor(private router: Router, private identity: Identity, private storage: Storage) { }

    public handleError(error: Response, allowArrayResult = false): any {
        let errorMessage: any = error.json();
    }

    public handleSuccess(args): any {

    }

    public handle401(): any {
        this.identity.update(null);
        this.storage.removeItem("authorizationData");
        this.router.navigate(['Login']);
    }

    public handle500(): any {
        //todo: notify user with error popup dialog or smth else
    }
}
