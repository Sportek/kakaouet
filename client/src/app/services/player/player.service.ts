import { Injectable } from '@angular/core';
import { PlayerClient, SortOrder, SortingCriteria } from '@common/game-types';
const SORT_MULTIPLYER = -1;
@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    sortPlayers(players: PlayerClient[], selectedCriterion: SortingCriteria, sortOrder: SortOrder): PlayerClient[] {
        return players.sort((a, b) => {
            let comparison = this.getComparison(a, b, selectedCriterion);
            if (sortOrder === SortOrder.descending) {
                comparison *= SORT_MULTIPLYER;
            }
            return comparison;
        });
    }

    private getComparison(a: PlayerClient, b: PlayerClient, criterion: SortingCriteria): number {
        switch (criterion) {
            case SortingCriteria.name:
                return this.compareByName(a, b);
            case SortingCriteria.score:
                return this.compareByScore(a, b);
            case SortingCriteria.status:
                return this.compareByStatus(a, b);
            default:
                return 0;
        }
    }

    private compareByName(a: PlayerClient, b: PlayerClient): number {
        return a.name.localeCompare(b.name);
    }

    private compareByScore(a: PlayerClient, b: PlayerClient): number {
        const comparison = a.score - b.score;
        return comparison === 0 ? this.compareByName(a, b) : comparison;
    }

    private compareByStatus(a: PlayerClient, b: PlayerClient): number {
        const comparison = this.getStateValue(a) - this.getStateValue(b);
        return comparison === 0 ? this.compareByName(a, b) : comparison;
    }

    private getStateValue(player: PlayerClient): number {
        const order = ['finalized', 'interacted', 'noInteraction', 'abandoned'];
        return order.indexOf(player.interactionStatus);
    }
}
