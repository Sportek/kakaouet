import { Component } from '@angular/core';
import { JoinService } from '@app/services/join/join.service';

@Component({
    selector: 'app-join',
    templateUrl: './join.component.html',
    styleUrls: ['./join.component.scss'],
})
export class JoinComponent {
    code: string = '';
    name: string = '';
    constructor(private joinService: JoinService) {}

    confirm(): void {
        this.joinService.join(this.code, this.name);
    }
}
