import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@app/services/user/user.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
    isLoggedIn$: Observable<boolean>;
    constructor(
        private userService: UserService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.isLoggedIn$ = this.userService.isLogin();
    }

    logout() {
        this.userService.logout(this.router);
    }

    isLogin(): Observable<boolean> {
        return this.userService.isLogin();
    }
}
