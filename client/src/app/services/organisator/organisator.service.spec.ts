/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameService } from '@app/services/game/game.service';
import { Variables } from '@common/enum-variables';
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

    it('should return players who have not given up', () => {
        const players: PlayerClient[] = service.players;
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

    it('should correctly update choice amounts and player ratings', () => {
        service.rateAnswerQRL('Alice', '1');

        const choiceForOldRating = service.choices.find((choice) => choice.text === '0.5');
        const choiceForNewRating = service.choices.find((choice) => choice.text === '1');

        expect(choiceForOldRating?.amount).toBe(2);
        expect(choiceForNewRating?.amount).toBe(1);
        expect(service.playerRatings.get('Alice')).toBe(5);
    });

    describe('sendRating', () => {
        it('should call filterPlayers and rateAnswerQRL on sendRating', () => {
            spyOn(service, 'filterPlayers').and.returnValue([service.players[0]]);
            service.sendRating('Alice');
            expect(service.filterPlayers).toHaveBeenCalled();
            expect(gameServiceMock.rateAnswerQRL).toHaveBeenCalledWith('Alice', 2);
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
            expect(service.currentPlayer).toEqual({
                name: 'Alice',
                score: 10,
                isExcluded: false,
                hasGiveUp: false,
                role: GameRole.Player,
                isMuted: false,
                interactionStatus: InteractionStatus.interacted,
            });
            expect(service.currentPlayerIndex).toBe(0);
            expect(service.calculateChoices).toHaveBeenCalled();
        });
    });

    it('histogram should be modified', () => {
        gameServiceMock.recentInteractions.get = jasmine.createSpy().and.callFake((name) => {
            const now = 5;
            return name === 'Alice' ? now - 1 : now + 1;
        });
        service.calculateHistogram(Variables.HistrogramCooldown);
        expect(service.histogram.hasModified).toBe(2);
        expect(service.histogram.hasNotModified).toBe(0);
        expect(gameServiceMock.recentInteractions.get).toHaveBeenCalledTimes(2);
    });

    it('histogram should not be modified', () => {
        gameServiceMock.recentInteractions.get = jasmine.createSpy().and.callFake((name) => {
            const now = Date.now();
            return name === 'Alice' ? now - 1000 : now + 100000;
        });
        service.calculateHistogram(Variables.HistrogramCooldown);
        expect(service.histogram.hasModified).toBe(0);
        expect(service.histogram.hasNotModified).toBe(2);
        expect(gameServiceMock.recentInteractions.get).toHaveBeenCalledTimes(2);
    });
});
