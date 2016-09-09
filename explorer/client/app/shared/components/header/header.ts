import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Identity, AuthApi, Storage } from '../../services';

@Component({
    selector: 'app-header',
    template: require('./header.html'),
    styles: [require('./header.scss')]
})
export class HeaderComponent implements OnInit {
    isAuthenticated: boolean = false;
    shouldRedirect: boolean;
    username: string;

    constructor(private identity: Identity, private auth: AuthApi, private router: Router, private storage: Storage) { }

    ngOnInit() {
        this.username = this.identity.user.name || "Guest";
        this.isAuthenticated = this.identity.user.isAuthenticated();
        this.identity.identity$
            .subscribe((user) => {
                this.isAuthenticated = user.isAuthenticated();
                this.username = user.name;
            });
    }
    signOut() {
        this.auth.signOut().subscribe(
            (res) => {
                this.identity.update();
                this.storage.removeItem("authorizationData")
            },
            (err) => {
                this.identity.update();
                this.storage.removeItem("authorizationData");
            }
        );
    }
}
