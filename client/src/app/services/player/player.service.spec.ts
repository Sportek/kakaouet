import { TestBed } from '@angular/core/testing';
import { InteractionStatus, PlayerClient, SortOrder, SortingCriteria } from '@common/game-types';
import { GameRole } from '@common/types';
import { PlayerService } from './player.service';

describe('PlayerService', () => {
    let service: PlayerService;
    let players: PlayerClient[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PlayerService],
        });
        service = TestBed.inject(PlayerService);

        players = [
            {
                name: 'Alice',
                score: 5,
                interactionStatus: InteractionStatus.finalized,
                role: GameRole.Organisator,
                isExcluded: false,
                isMuted: false,
                hasGiveUp: false,
            },
            {
                name: 'Bob',
                score: 7,
                interactionStatus: InteractionStatus.interacted,
                role: GameRole.Organisator,
                isExcluded: false,
                isMuted: false,
                hasGiveUp: false,
            },
            {
                name: 'Charlie',
                score: 5,
                interactionStatus: InteractionStatus.noInteraction,
                role: GameRole.Organisator,
                isExcluded: false,
                isMuted: false,
                hasGiveUp: false,
            },
        ];
    });

    it('should sort players by name ascending', () => {
        const sorted = service.sortPlayers(players, SortingCriteria.name, SortOrder.ascending);
        expect(sorted[0].name).toBe('Alice');
        expect(sorted[1].name).toBe('Bob');
        expect(sorted[2].name).toBe('Charlie');
    });

    it('should sort players by score descending', () => {
        const sorted = service.sortPlayers(players, SortingCriteria.score, SortOrder.descending);
        expect(sorted[0].name).toBe('Bob');
        expect(sorted[1].name).toBe('Charlie');
        expect(sorted[2].name).toBe('Alice');
    });

    it('should sort players by status and use name as tiebreaker', () => {
        const sorted = service.sortPlayers(players, SortingCriteria.status, SortOrder.ascending);
        expect(sorted[0].interactionStatus).toBe('finalized');
        expect(sorted[1].interactionStatus).toBe('interacted');
        expect(sorted[2].interactionStatus).toBe('noInteraction');
    });

    it('should emit sorted players when sortPlayers is called', (done) => {
        service.getSortedPlayersObservable().subscribe((sortedPlayers) => {
            expect(sortedPlayers.length).toBe(0);
            done();
        });

        service.sortPlayers(players, SortingCriteria.score, SortOrder.descending);
    });
});
