import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    template: require('./header.html'),
    styles: [require('./header.scss')]
})
export class HeaderComponent implements OnInit {
    isAuthenticated: boolean = false;
    shouldRedirect: boolean;
    username: string;

    constructor( private router: Router) { }

    ngOnInit() {
       /* this.username = this.identity.user.name || "Guest";
        this.isAuthenticated = this.identity.user.isAuthenticated();
        this.identity.identity$
            .subscribe((user) => {
                this.isAuthenticated = user.isAuthenticated();
                this.username = user.name;
            });*/
    }
    signOut() {
      /* this.auth.signOut().subscribe(
            (res) => {
                this.identity.update();
                this.storage.removeItem("authorizationData")
            },
            (err) => {
                this.identity.update();
                this.storage.removeItem("authorizationData");
            }
        );*/
    }
}
