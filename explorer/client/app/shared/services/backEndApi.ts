import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http } from '@angular/http';

@Injectable()
export class BackEnd {

  constructor(private _http: Http) { }

  public getPlugins(): Observable<any> {
    return this._http
      .get("/api/plugins")
      .map(res => res.json());
  }
  public getApiConfigs(): Observable<any> {
    return this._http
      .get("/api/configs")
      .map(res => res.json());
  }

  public getAvailableDrivers(): Observable<any> {
    return this._http
      .get("/api/drivers")
      .map(res => res.json());
  }
  public getDriverConfigurations(name): Observable<any> {
    return this._http
      .get(`/api/drivers/${name}`)
      .map(res => res.json());
  }

  public getDriverTemplateByName(name): Observable<any> {
    return this._http
      .get(`/api/driver/config/${name}`)
      .map(res => res.json());
  }

  public getConfig(id): Observable<any> {
    return this._http
      .get(`/api/config/${id}`)
      .map(res => res.json());
  }

  public createOrUpdate(data: any, id?: string) {
    return this._http
      .post(`/api/config/${id}`, JSON.stringify(data))
      .map(res => res.json());
  }

  public createOrUpdateDriver(driver: any) {
    return this._http
      .post(`/api/driver/${driver.id ? driver.id : ''}`, JSON.stringify(driver))
      .map(res => res.json());
  }


  public deleteApiConfig(id) {
    return this._http
      .delete(`/api/config/${id}`)
      .map(res => res.json());
  }
  public getDriverConfig(id) {
    return this._http
      .get(`/api/driver/${id}`)
      .map(res => res.json());
  }
}
