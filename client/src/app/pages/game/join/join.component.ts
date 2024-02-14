import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-join',
    templateUrl: './join.component.html',
    styleUrls: ['./join.component.scss'],
})
export class JoinComponent {
    code: string = '';
    constructor(private router: Router) {}
    joinGame() {
        this.router.navigate(['/game', this.code]);
    }
}
