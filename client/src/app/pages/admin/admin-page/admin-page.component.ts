import { Component, OnInit } from '@angular/core';
import { UserService } from '@app/services/user/user.service';
@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    constructor(private userService: UserService) {}

    ngOnInit() {
        this.userService.checkAndRedirect('/admin/login');
    }
}
