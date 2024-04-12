import { Component } from '@angular/core';
import { HistoryService } from '@app/services/history/history.service';

@Component({
    selector: 'app-admin-game-history',
    templateUrl: './admin-game-history.component.html',
    styleUrls: ['./admin-game-history.component.scss'],
})
export class AdminGameHistoryComponent {
    constructor(private historyService: HistoryService) {}

    clearHistory() {
        this.historyService.confirmClearHistory();
    }
}
