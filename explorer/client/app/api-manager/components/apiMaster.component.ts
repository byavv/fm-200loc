import { Component, OnInit, ViewChild, QueryList } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MASTER_STEPS_COMPONENTS } from "./steps";
import { MasterController } from "../services/masterController";
import { ApiConfigApi } from "../../shared/services";
import { Config } from "../../shared/models"
import { UiTabs, UiPane, RestSize } from '../directives';
import { Observable, Subscription } from "rxjs";


@Component({
  selector: "api-master",
  template: `
    <div class="row">
        <div class="col-md-12 col-sm-12" style="position: relative;">             
            <ui-tabs #tab rest-height default='general'>
                <ui-pane id='general' title='config' [valid]="(master.isValid('general') | async)">
                    <step-general (next)="tab.goTo($event)"></step-general>
                </ui-pane>
                <ui-pane id='plugins' title='pipe' [valid]="(master.isValid('plugins') | async)">
                    <step-plugins (next)="tab.goTo($event)"></step-plugins>
                </ui-pane>
                <ui-pane id='preview' title='test' [valid]='true'>
                    <step-preview (next)="onDone()"></step-preview>
                </ui-pane>     
            </ui-tabs>
        </div>
    </div>
    `,
  viewProviders: [MasterController]
})

export class ApiMasterComponent {
  @ViewChild(UiTabs) tab: UiTabs;
  id: string;
  loading: boolean = true;
  queryRouteSub: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private master: MasterController,
    private apiConfigApi: ApiConfigApi) {
    this.queryRouteSub = this.route
      .queryParams
      .flatMap((params) => {
        this.id = params["id"];
        return this.id
          ? this.apiConfigApi.findById(this.id)
          : Observable.of(new Config());
      })
      .subscribe((config) => {
        this.master.init(config);
      });
  }
  ngOnDestroy() {
    this.queryRouteSub.unsubscribe();
  }

  onDone() {
    this.master
      .validate()
      .do(() => { this.loading = true; })
      .flatMap(() => this.apiConfigApi.upsert(this.master.config))
      .subscribe((result) => {
        this.router.navigate(['/']);
      }, (err) => {
        if (err)
          this.tab.goTo(err);
      });
  }
}