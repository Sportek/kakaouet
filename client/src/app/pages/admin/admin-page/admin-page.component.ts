import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@app/services/user/user.service';
@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    constructor(
        private router: Router,
        private userService: UserService,
    ) {
        if (!this.userService.isLogin()) this.router.navigateByUrl('/admin/login', { replaceUrl: true });
    }
}
