/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameService } from '@app/services/game/game.service';
import { InteractionStatus, PlayerClient } from '@common/game-types';
import { GameRole, QuestionType } from '@common/types';
import { OrganisatorService } from './organisator.service';

describe('OrganisatorService', () => {
    let service: OrganisatorService;
    let mockSnackbar: jasmine.SpyObj<MatSnackBar>;
    let gameServiceMock: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        gameServiceMock = jasmine.createSpyObj('GameService', ['filterPlayers']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: MatSnackBar, useValue: mockSnackbar },
                { provide: GameService, useValue: gameServiceMock },
            ],
        });
        service = TestBed.inject(OrganisatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return players who have not given up', () => {
        const players: PlayerClient[] = [
            {
                name: 'Alice',
                hasGiveUp: false,
                role: GameRole.Player,
                score: 10,
                isExcluded: false,
                isMuted: false,
                interactionStatus: InteractionStatus.interacted,
            },
            {
                name: 'Bob',
                hasGiveUp: true,
                role: GameRole.Player,
                score: 5,
                isExcluded: true,
                isMuted: false,
                interactionStatus: InteractionStatus.noInteraction,
            },
        ];
        gameServiceMock.filterPlayers.and.returnValue(players);

        const filteredPlayers = service.filterPlayers();

        expect(filteredPlayers.length).toBe(1);
        expect(filteredPlayers).toEqual([
            {
                name: 'Alice',
                hasGiveUp: false,
                role: GameRole.Player,
                score: 10,
                isExcluded: false,
                isMuted: false,
                interactionStatus: InteractionStatus.interacted,
            },
        ]);
        expect(gameServiceMock.filterPlayers).toHaveBeenCalled();
    });

    describe('calculateChoices', () => {
        beforeEach(() => {
            service.actualQuestion = {
                question: {
                    _id: 'im_definitly_an_id_u_can_trust',
                    text: 'What is your favorite sushi?',
                    type: QuestionType.QCM,
                    points: 5,
                    createdAt: new Date(),
                    lastModification: new Date(),
                    choices: [
                        {
                            _id: 0,
                            text: 'salmon nigiri',
                            isCorrect: true,
                        },
                        {
                            _id: 1,
                            text: 'squid nigiri',
                            isCorrect: false,
                        },
                        {
                            _id: 2,
                            text: 'fatty tuna',
                            isCorrect: false,
                        },
                    ],
                },
                totalQuestion: 3,
                actualIndex: 0,
            };

            const players: PlayerClient[] = [
                {
                    name: 'Alice',
                    answers: { answer: [0, 1], hasInterracted: true, hasConfirmed: true },
                    hasGiveUp: false,
                    role: GameRole.Player,
                    score: 0,
                    isExcluded: false,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
                {
                    name: 'Bob',
                    answers: { answer: [1], hasInterracted: true, hasConfirmed: true },
                    hasGiveUp: false,
                    role: GameRole.Player,
                    score: 0,
                    isExcluded: false,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
                {
                    name: 'Charlie',
                    answers: { answer: [2], hasInterracted: true, hasConfirmed: true },
                    hasGiveUp: true,
                    role: GameRole.Player,
                    score: 0,
                    isExcluded: false,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
            ];

            gameServiceMock.filterPlayers.and.returnValue(players.filter((p) => !p.hasGiveUp));
        });

        it('should correctly calculate choice amounts based on player answers', () => {
            service.calculateChoices();

            expect(service.choices).toEqual([
                { text: 'salmon nigiri', amount: 1, isCorrect: true },
                { text: 'squid nigiri', amount: 2, isCorrect: false },
                { text: 'fatty tuna', amount: 0, isCorrect: false },
            ]);
        });
    });
});
