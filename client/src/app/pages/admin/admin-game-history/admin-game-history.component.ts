import { Component, ViewChild } from '@angular/core';
import { HistoryComponent } from '@app/pages/history/history.component';

@Component({
    selector: 'app-admin-game-history',
    templateUrl: './admin-game-history.component.html',
    styleUrls: ['./admin-game-history.component.scss'],
})
export class AdminGameHistoryComponent {
    @ViewChild(HistoryComponent) historyComponent!: HistoryComponent;
}
