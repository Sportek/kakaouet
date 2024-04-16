/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameService } from '@app/services/game/game.service';
import { ActualQuestion, InteractionStatus, PlayerClient } from '@common/game-types';
import { GameRole, QuestionType } from '@common/types';
import { OrganisatorService, baseQRLRatings } from './organisator.service';
describe('OrganisatorService', () => {
    let service: OrganisatorService;
    let gameServiceMock: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        gameServiceMock = jasmine.createSpyObj('GameService', ['filterPlayers', 'recentInteractions', 'rateAnswerQRL']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
                { provide: GameService, useValue: gameServiceMock },
            ],
        });
        service = TestBed.inject(OrganisatorService);
        service.actualQuestion = {
            question: {
                _id: 'newID',
                type: QuestionType.QCM,
                text: 'What is 2 + 1 ?',
                points: 5,
                createdAt: new Date(),
                lastModification: new Date(),
                choices: [],
            },
            totalQuestion: 5,
            actualIndex: 1,
        };
        service.choices = [
            { text: '0', amount: 1, isCorrect: true },
            { text: '0.5', amount: 2, isCorrect: false },
            { text: '1', amount: 0, isCorrect: true },
        ];
        service.playerRatings.set('Alice', 2);
        service.players = [
            {
                name: 'Alice',
                role: GameRole.Player,
                score: 10,
                isExcluded: false,
                hasGiveUp: false,
                isMuted: false,
                interactionStatus: InteractionStatus.interacted,
            },
            {
                name: 'Bob',
                role: GameRole.Player,
                score: 5,
                isExcluded: false,
                hasGiveUp: true,
                isMuted: false,
                interactionStatus: InteractionStatus.noInteraction,
            },
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should correctly update choice amounts and player ratings', () => {
        service.rateAnswerQRL('Alice', '1');

        const choiceForOldRating = service.choices.find((choice) => choice.text === '0.5');
        const choiceForNewRating = service.choices.find((choice) => choice.text === '1');

        expect(choiceForOldRating?.amount).toBe(2);
        expect(choiceForNewRating?.amount).toBe(1);
        expect(service.playerRatings.get('Alice')).toBe(5);
    });

    describe('sendRating', () => {
        let mockSetNewPlayer: jasmine.Spy;

        beforeEach(() => {
            mockSetNewPlayer = spyOn(service, 'setNewPlayer').and.callThrough();
        });

        it('should send player rating and set new player if the player is found', () => {
            const playerName = 'Alice';
            service.sendRating(playerName);
            expect(mockSetNewPlayer).toHaveBeenCalled();
        });

        it('should not send rating if the player is not found', () => {
            const playerName = 'Charlie';
            service.sendRating(playerName);
            expect(gameServiceMock.rateAnswerQRL).not.toHaveBeenCalled();
            expect(mockSetNewPlayer).toHaveBeenCalled();
        });
    });

    describe('setNewPlayer', () => {
        it('should update currentPlayer to the next player in the list', () => {
            service.currentPlayerIndex = 0;
            service.setNewPlayer();
            expect(service.currentPlayer).toEqual(service.players[1]);
            expect(service.currentPlayerIndex).toBe(1);
        });

        it('should not update currentPlayer if it is the last player in the list', () => {
            service.currentPlayerIndex = service.players.length - 1;
            service.setNewPlayer();
            expect(service.currentPlayerIndex).toBe(service.players.length - 1);
        });

        it('should skip players who have given up and find the next available player', () => {
            service.players[1].hasGiveUp = true;
            service.currentPlayerIndex = 0;
            service.setNewPlayer();
            expect(service.currentPlayerIndex).toBe(1);
        });
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

    describe('setActualQuestion', () => {
        beforeEach(() => {
            spyOn(service, 'calculateChoices');
        });
        it('should set the actualQuestion and update choices if the question type is QRL', () => {
            const question: ActualQuestion = {
                question: {
                    _id: 'q1',
                    type: QuestionType.QRL,
                    text: 'Estimate the value of pi to one decimal place.',
                    points: 10,
                    createdAt: new Date(),
                    lastModification: new Date(),
                },
                totalQuestion: 5,
                actualIndex: 1,
            };

            service.setActualQuestion(question);
            expect(service.actualQuestion).toEqual(question);
            expect(service.choices).toEqual(baseQRLRatings);
            expect(service.calculateChoices).toHaveBeenCalled();
        });

        it('should set the actualQuestion but not update choices if the question type is not QRL', () => {
            const question: ActualQuestion = {
                question: {
                    _id: 'q2',
                    type: QuestionType.QCM,
                    text: 'What is 2 + 2?',
                    points: 5,
                    createdAt: new Date(),
                    lastModification: new Date(),
                    choices: [],
                },
                totalQuestion: 5,
                actualIndex: 1,
            };

            service.setActualQuestion(question);
            expect(service.actualQuestion).toEqual(question);
            expect(service.choices).not.toEqual(baseQRLRatings);
            expect(service.calculateChoices).toHaveBeenCalled();
        });
    });

    describe('setPlayers', () => {
        it('should sort, filter players and set the first player as current', () => {
            const players: PlayerClient[] = [
                {
                    name: 'Charlie',
                    score: 20,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
                {
                    name: 'Alice',
                    score: 10,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
                {
                    name: 'Bob',
                    score: 15,
                    isExcluded: false,
                    hasGiveUp: true,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
            ];

            spyOn(service, 'filterPlayers').and.returnValue([
                {
                    name: 'Alice',
                    score: 10,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
                {
                    name: 'Charlie',
                    score: 20,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
            ]);
            spyOn(service, 'calculateChoices');
            service.setPlayers(players);

            expect(service.players).toEqual([
                {
                    name: 'Alice',
                    score: 10,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
                {
                    name: 'Charlie',
                    score: 20,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
            ]);
            expect(service.currentPlayer).toBeUndefined();
        });
    });

    describe('reinitialisePlayerToRate', () => {
        let mockSetNewPlayer: jasmine.Spy;

        beforeEach(() => {
            mockSetNewPlayer = spyOn(service, 'setNewPlayer').and.callThrough();
        });

        it('should set currentPlayer and currentPlayerIndex to the first player and zero', () => {
            service.players = [
                {
                    name: 'Alice',
                    score: 10,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
                {
                    name: 'Charlie',
                    score: 20,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
            ];
            service.reinitialisePlayerToRate();

            expect(service.currentPlayer).toEqual(service.players[0]);
            expect(service.currentPlayerIndex).toBe(0);
            expect(mockSetNewPlayer).not.toHaveBeenCalled();
        });

        it('should call setNewPlayer if the first player has given up', () => {
            service.players = [
                {
                    name: 'Alice',
                    score: 10,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
                {
                    name: 'Charlie',
                    score: 20,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
            ];
            service.reinitialisePlayerToRate();

            expect(service.currentPlayerIndex).toBe(0);
            expect(mockSetNewPlayer).not.toHaveBeenCalled();
        });
    });

    describe('filterPlayers', () => {
        beforeEach(() => {
            gameServiceMock.filterPlayers.and.returnValue([
                {
                    name: 'Alice',
                    score: 10,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
                {
                    name: 'Charlie',
                    score: 20,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
                {
                    name: 'Bob',
                    score: 20,
                    isExcluded: true,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
            ]);
        });

        it('should call gameService.filterPlayers and filter out excluded players', () => {
            const filteredPlayers = service.filterPlayers();
            expect(gameServiceMock.filterPlayers).toHaveBeenCalled();
            expect(filteredPlayers.length).toBe(2);
            expect(filteredPlayers).toEqual([
                {
                    name: 'Alice',
                    score: 10,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
                {
                    name: 'Charlie',
                    score: 20,
                    isExcluded: false,
                    hasGiveUp: false,
                    role: GameRole.Player,
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
            ]);
        });
    });
});
