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
        // TODO: Sprint 2 d'autres vérifications devront être effectuées
        this.router.navigate(['/game', this.code]);
    }
}
