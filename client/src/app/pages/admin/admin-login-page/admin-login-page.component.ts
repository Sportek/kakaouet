import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminLoginState, UserService } from '@app/services/user/user.service';

@Component({
    selector: 'app-admin-login-page',
    templateUrl: './admin-login-page.component.html',
    styleUrls: ['./admin-login-page.component.scss'],
})
export class AdminLoginPageComponent {
    password: string;
    loggedState: AdminLoginState;
    private userService: UserService;
    private router: Router;
    constructor(router: Router, userService: UserService) {
        this.userService = userService;
        this.router = router;
        this.loggedState = userService.getLoginState();
    }
    submitPassword() {
        this.userService.login(this.router, this.password);
        this.loggedState = this.userService.getLoginState();
    }

    onKeyEnter(event: KeyboardEvent) {
        if (event.key === 'Enter') this.submitPassword();
    }
}
