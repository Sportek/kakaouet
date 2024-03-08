import { Component } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly teamNumber: number = 109;
    readonly teamMembers: string[] = ['Elie Boulanger', 'Gabriel Landry', 'Yacine Lawali', 'Dimitri Maguin', 'Mohammad Jamil Miah', 'Thomas Petrie'];

    constructor(private socketService: SocketService) {}

    joinGame(): void {
        this.socketService.connect();
    }
}
