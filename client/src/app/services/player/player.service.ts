import { Injectable } from '@angular/core';
import { PlayerClient, SortOrder, SortingCriteria } from '@common/game-types';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  constructor() {}

  sortPlayers(players: PlayerClient[], selectedCriterion: SortingCriteria, sortOrder: SortOrder): PlayerClient[] {
    return players.sort((a, b) => {
      let comparison = 0;

      switch (selectedCriterion) {
        case SortingCriteria.name:
          comparison = a.name.localeCompare(b.name);
          break;
        case SortingCriteria.score:
          comparison = a.score - b.score;
          if (comparison === 0) {
            comparison = a.name.localeCompare(b.name); // Secondary sort by name in case of tie
          }
          break;
        case SortingCriteria.status:
          comparison = this.getStateValue(a) - this.getStateValue(b);
          if (comparison === 0) {
            comparison = a.name.localeCompare(b.name); // Secondary sort by name in case of tie
          }
          break;
      }

      if (sortOrder === SortOrder.descending) {
        comparison = -comparison; // Reverse the comparison for descending order
      }

      return comparison;
    });
  }

  private getStateValue(player: PlayerClient): number {
    const order = ['noInteraction', 'interacted', 'finalized', 'abandoned'];
    return order.indexOf(player.interactionStatus);
  }
}
