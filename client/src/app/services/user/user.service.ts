import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export enum AdminLoginState {
    LoggedIn = 'LoggedIn',
    Failed = 'Failed',
    NotLoggedIn = 'NotLoggedIn',
}
@Injectable({
    providedIn: 'root',
})
export class UserService {
    private loggedState: AdminLoginState = AdminLoginState.NotLoggedIn;

    login(router: Router, password: string) {
        // TODO: Faire une requête au serveur pour vérifier le mot de passe
        if (password === 'admin') {
            this.loggedState = AdminLoginState.LoggedIn;
            router.navigateByUrl('/admin', { replaceUrl: true });
            return;
        }

        this.loggedState = AdminLoginState.Failed;
    }

    isLogin() {
        return this.loggedState === AdminLoginState.LoggedIn;
    }

    getLoginState() {
        return this.loggedState;
    }
}
