/* tslint:disable */
import { Injectable } from '@angular/core';
import { StorageDriver } from '../storage/storage.driver';
import { Subject, Observable } from 'rxjs';
import { User } from '../../models';

@Injectable()
export class LoopBackAuth {
  private _user: User;

  protected propsPrefix: string = '$LoopBack$';
  private _dispatch: Subject<User> = new Subject<User>();
  constructor() {
    this.user = new User();
  }
  public get user(): User {
    return this._user;
  }
  public set user(value) {
    this._user = value;
  }
  public get identity$(): Observable<User> {
    return this._dispatch.asObservable();
  };

  public update(data?: any): void {
    let user = new User();
    if (!!data && !!data.accessToken) {
      user.accessToken = data.accessToken;
      user.username = data.username;
    }
    this.user = user;
    this._dispatch.next(this.user);
  }

  public initFromStorage(): User {
    var accessToken = this.load('accessToken');
    var username = this.load('username');
    var user = new User();
    user.accessToken = this.load('accessToken');
    user.username = this.load('username');
    return user;
  }

  public saveToStorage() {
    this.saveThis("accessToken", this.user.accessToken);
    this.saveThis("username", this.user.username);
  }

  public save() {
    this.saveThis("accessToken", this.user.accessToken);
    this.saveThis("username", this.user.username);
  };

  public clearStorage() {
    StorageDriver.remove(this.propsPrefix + 'accessToken');
    StorageDriver.remove(this.propsPrefix + 'username');
  };

  protected saveThis(name: string, value: any) {
    try {
      var key = this.propsPrefix + name;
      StorageDriver.set(key, value);
    }
    catch (err) {
      console.log('Cannot access local/session storage:', err);
    }
  }

  protected load(name: string): any {
    var key = this.propsPrefix + name;
    return StorageDriver.get(key);
  }
}