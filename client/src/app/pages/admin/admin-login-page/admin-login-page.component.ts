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

    constructor(
        private router: Router,
        private userService: UserService,
    ) {
        this.userService = userService;
        this.router = router;
    }
    submitPassword() {
        this.userService.login(this.router, this.password);
    }

    onKeyEnter(event: KeyboardEvent) {
        if (event.key === 'Enter') this.submitPassword();
    }
}
