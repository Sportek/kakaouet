import { Injectable } from '@angular/core';
import { PlayerClient, SortingCriteria } from '@common/game-types';
import { Ordering } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';
const SORT_MULTIPLYER = -1;
@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    private sortedPlayersSubject: BehaviorSubject<PlayerClient[]> = new BehaviorSubject<PlayerClient[]>([]);
    getSortedPlayersObservable(): Observable<PlayerClient[]> {
        return this.sortedPlayersSubject.asObservable();
    }
    sortPlayers(players: PlayerClient[], selectedCriterion: SortingCriteria, sortOrder: Ordering): PlayerClient[] {
        return players.sort((a, b) => {
            let comparison = this.getComparison(a, b, selectedCriterion);
            if (sortOrder === Ordering.Descendant) {
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
