/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameService } from '@app/services/game/game.service';
import { OrganisatorService } from '@app/services/organisator/organisator.service';
import { PlayerService } from '@app/services/player/player.service';
import { ActualQuestion, ChoiceData, InteractionStatus, PlayerClient, SortOrder, SortingCriteria } from '@common/game-types';
import { GameRole, GameState, QuestionType } from '@common/types';
import { BehaviorSubject } from 'rxjs';
import { OrganisatorComponent } from './organisator.component';

describe('OrganisatorComponent', () => {
    const mockedHistogram = {
        hasModified: 10,
        hasNotModified: 5,
    };

    const mockedPlayerRatings = new Map<string, number>([
        ['Alice', 95],
        ['Bob', 88],
    ]);

    const mockedPlayer: PlayerClient = {
        name: 'chirac',
        role: GameRole.Player,
        score: 15,
        isExcluded: false,
        hasGiveUp: false,
        answers: {
            answer: [0, 1],
            hasInterracted: true,
            hasConfirmed: false,
        },
        isMuted: false,
        interactionStatus: InteractionStatus.interacted,
    };

    const mockedCurrentPlayer: PlayerClient = {
        name: 'obama',
        role: GameRole.Player,
        score: 15,
        isExcluded: false,
        hasGiveUp: false,
        answers: {
            answer: [0, 1],
            hasInterracted: true,
            hasConfirmed: true,
        },
        isMuted: false,
        interactionStatus: InteractionStatus.interacted,
    };
    const mockedPlayers: PlayerClient[] = [
        {
            name: 'Alice',
            role: GameRole.Player,
            score: 10,
            isExcluded: false,
            hasGiveUp: false,
            answers: {
                answer: [0, 1],
                hasInterracted: true,
                hasConfirmed: true,
            },
            isMuted: false,
            interactionStatus: InteractionStatus.interacted,
        },
        {
            name: 'Bob',
            role: GameRole.Player,
            score: 15,
            isExcluded: true,
            hasGiveUp: true,
            answers: {
                answer: [0, 1],
                hasInterracted: true,
                hasConfirmed: true,
            },
            isMuted: true,
            interactionStatus: InteractionStatus.interacted,
        },
    ];
    const mockedActualQuestion: ActualQuestion = {
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
    const mockedChoices: ChoiceData[] = [
        { text: 'Choice 1', amount: 100, isCorrect: true },
        { text: 'Choice 2', amount: 200, isCorrect: false },
    ];
    let fakeCooldown: 10;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let organisatorServiceSpy: jasmine.SpyObj<OrganisatorService>;
    let component: OrganisatorComponent;
    let fixture: ComponentFixture<OrganisatorComponent>;

    beforeEach(waitForAsync(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', [
            'filterPlayers',
            'toggleMutePlayer',
            'isLastQuestion',
            'speedUpTimer',
            'toggleTimer',
            'nextQuestion',
            'toggleMutePlayer',
        ]);
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['sortPlayers']);
        organisatorServiceSpy = jasmine.createSpyObj(
            'OrganisatorService',
            ['filterPlayers', 'rateAnswerQRL', 'sendRating', 'calculateChoices', 'toggleTimer', 'speedUpTimer', 'nextQuestion'],
            {
                choices: mockedChoices,
                actualQuestion: mockedActualQuestion,
                players: mockedPlayers,
                currentPlayer: mockedCurrentPlayer,
                histogram: mockedHistogram,
                playerRatings: mockedPlayerRatings,
            },
        );

        gameServiceSpy.filterPlayers.and.returnValue(mockedPlayers);

        // Setup return values for observables
        gameServiceSpy.actualQuestion = new BehaviorSubject<ActualQuestion | null>(mockedActualQuestion);
        gameServiceSpy.cooldown = new BehaviorSubject<number>(fakeCooldown);
        gameServiceSpy.players = new BehaviorSubject<PlayerClient[]>(mockedPlayers);

        TestBed.configureTestingModule({
            declarations: [OrganisatorComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: OrganisatorService, useValue: organisatorServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganisatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getChoices', () => {
        it('should return choices from organisatorService', () => {
            const choices = component.getChoices();
            expect(choices).toEqual(mockedChoices);
        });
    });

    describe('getActualQuestion', () => {
        it('should return the actual question from organisatorService', () => {
            const actualQuestion = component.getActualQuestion();
            expect(actualQuestion).toEqual(mockedActualQuestion);
        });
    });

    describe('getPlayerArray', () => {
        it('should return the players from organisatorService', () => {
            const players = component.getPlayerArray();
            expect(players).toEqual(mockedPlayers);
        });
    });

    describe('getCurrentPlayer', () => {
        it('should return the player from organisatorService', () => {
            const currentPlayer = component.getCurrentPlayer();
            expect(currentPlayer).toEqual(mockedCurrentPlayer);
        });
    });

    describe('getHistogram', () => {
        it('should return histogram data from organisatorService', () => {
            const histogram = component.getHistogram();
            expect(histogram).toEqual(mockedHistogram);
        });
    });

    describe('getPlayerRatings', () => {
        it('should return player ratings from organisatorService', () => {
            const playerRatings = component.getPlayerRatings();
            expect(playerRatings).toEqual(mockedPlayerRatings);
        });
    });

    describe('filterPlayers', () => {
        it('should return filtered players from organisatorService', () => {
            const expectedPlayers: PlayerClient[] = [
                {
                    name: 'Alice',
                    role: GameRole.Player,
                    score: 10,
                    isExcluded: false,
                    hasGiveUp: true,
                    answers: {
                        answer: [0, 1],
                        hasInterracted: true,
                        hasConfirmed: true,
                    },
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
            ];
            organisatorServiceSpy.filterPlayers.and.returnValue(expectedPlayers);
            const result = component.filterPlayers();
            expect(result).toEqual(expectedPlayers);
        });
    });

    describe('sortPlayers', () => {
        it('should call sortPlayers on PlayerService and update players', () => {
            playerServiceSpy.sortPlayers.and.callFake((players, criterion, order) => {
                return players.sort((a: any, b: any) => {
                    switch (criterion) {
                        case SortingCriteria.score: {
                            return order === SortOrder.ascending ? a.score - b.score : b.score - a.score;
                        }
                        case SortingCriteria.name: {
                            return order === SortOrder.ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                        }
                        case SortingCriteria.status: {
                            return order === SortOrder.ascending ? a.isExcluded - b.isExcluded : b.isExcluded - a.isExcluded;
                        }
                    }
                    return 0;
                });
            });

            component.players = [...mockedPlayers];
            component.selectedCriterion = SortingCriteria.score;
            component.sortingOrder = SortOrder.ascending;

            component.sortPlayers();

            expect(playerServiceSpy.sortPlayers).toHaveBeenCalledWith(component.players, SortingCriteria.score, SortOrder.ascending);

            expect(component.players).toEqual([mockedPlayers[0], mockedPlayers[1]]);
        });
    });

    describe('toggleSortOrder', () => {
        it('should toggle sortingOrder and call sortPlayers', () => {
            component.sortingOrder = SortOrder.ascending;
            const sortPlayersSpy = spyOn(component, 'sortPlayers');

            component.toggleSortOrder();
            expect(component.sortingOrder).toEqual(SortOrder.descending);
            expect(sortPlayersSpy).toHaveBeenCalled();
            sortPlayersSpy.calls.reset();

            component.toggleSortOrder();
            expect(component.sortingOrder).toEqual(SortOrder.ascending);
            expect(sortPlayersSpy).toHaveBeenCalled();
        });
    });

    describe('isAnsweringQRL', () => {
        beforeEach(() => {
            gameServiceSpy.gameState = new BehaviorSubject<GameState>(GameState.PlayersAnswerQuestion); // Set default state
        });

        /* it('should return true when the game state is PlayersAnswerQuestion and the question type is QRL', () => {
            gameServiceSpy.gameState.next(GameState.PlayersAnswerQuestion);
            expect(component.isAnsweringQRL()).toBeTrue();
        });*/

        it('should return false when the game state is not PlayersAnswerQuestion', () => {
            gameServiceSpy.gameState.next(GameState.OrganisatorCorrectingAnswers);
            expect(component.isAnsweringQRL()).toBeFalse();
        });

        /* it('should return false when the question type is not QRL', () => {
            gameServiceSpy.gameState.next(GameState.PlayersAnswerQuestion);
            expect(component.isAnsweringQRL()).toBeFalse();
        });*/
    });

    describe('isDisplayingResults', () => {
        beforeEach(() => {
            gameServiceSpy.gameState = new BehaviorSubject<GameState>(GameState.PlayersAnswerQuestion); // Set default state
        });
        it('should return true when the game state is DisplayQuestionResults', () => {
            gameServiceSpy.gameState.next(GameState.DisplayQuestionResults);
            expect(component.isDisplayingResults()).toBeTrue();
        });

        it('should return false when the game state is not DisplayQuestionResults', () => {
            gameServiceSpy.gameState.next(GameState.PlayersAnswerQuestion);
            expect(component.isDisplayingResults()).toBeFalse();
        });
    });

    describe('isCorrectingAnswers', () => {
        beforeEach(() => {
            gameServiceSpy.gameState = new BehaviorSubject<GameState>(GameState.PlayersAnswerQuestion); // Set default state
        });
        it('should return true when the game state is OrganisatorCorrectingAnswers', () => {
            gameServiceSpy.gameState.next(GameState.OrganisatorCorrectingAnswers);
            expect(component.isCorrectingAnswers()).toBeTrue();
        });

        it('should return false when the game state is not OrganisatorCorrectingAnswers', () => {
            gameServiceSpy.gameState.next(GameState.PlayersAnswerQuestion);
            expect(component.isCorrectingAnswers()).toBeFalse();
        });
    });

    describe('isQRL', () => {
        it('should return true when the question type is QRL', () => {
            const qrlQuestion = new BehaviorSubject<ActualQuestion | null>({
                question: {
                    _id: 'q1',
                    type: QuestionType.QRL,
                    text: 'Example text',
                    points: 5,
                    createdAt: new Date(),
                    lastModification: new Date(),
                },
                totalQuestion: 10,
                actualIndex: 1,
            });
            gameServiceSpy.actualQuestion = qrlQuestion;
            expect(component.isQRL()).toBeTrue();
        });

        it('should return false when the question type is not QRL', () => {
            const qcmQuestion = new BehaviorSubject<ActualQuestion | null>({
                question: {
                    _id: 'q2',
                    type: QuestionType.QCM,
                    text: 'Example text',
                    points: 5,
                    createdAt: new Date(),
                    lastModification: new Date(),
                    choices: [],
                },
                totalQuestion: 10,
                actualIndex: 1,
            });
            gameServiceSpy.actualQuestion = qcmQuestion;
            expect(component.isQRL()).toBeFalse();
        });
    });

    describe('isLastQuestion', () => {
        it('should return true when the game service indicates it is the last question', () => {
            gameServiceSpy.isLastQuestion.and.returnValue(true);
            expect(component.isLastQuestion()).toBeTrue();
        });

        it('should return false when the game service indicates it is not the last question', () => {
            gameServiceSpy.isLastQuestion.and.returnValue(false);
            expect(component.isLastQuestion()).toBeFalse();
        });
    });

    describe('speedUpTimer', () => {
        it('should call speedUpTimer on GameService', () => {
            component.speedUpTimer();
            expect(gameServiceSpy.speedUpTimer).toHaveBeenCalled();
        });
    });

    describe('calculateChoices', () => {
        it('should call calculateChoices on OrganisatorService', () => {
            component.calculateChoices();
            expect(organisatorServiceSpy.calculateChoices).toHaveBeenCalled();
        });
    });

    describe('toggleTimer', () => {
        it('should toggle timerIsRunning and call toggleTimer on GameService', () => {
            component.timerIsRunning = true;
            component.toggleTimer();
            expect(gameServiceSpy.toggleTimer).toHaveBeenCalled();
            expect(component.timerIsRunning).toBeFalse();

            component.toggleTimer();
            expect(component.timerIsRunning).toBeTrue();
        });
    });

    describe('nextQuestion', () => {
        it('should call nextQuestion on gameService', () => {
            component.nextQuestion();
            expect(gameServiceSpy.nextQuestion).toHaveBeenCalled();
        });
    });

    describe('toggleMutePlayer', () => {
        it('should call toggleMutePlayer on GameService with the correct player', () => {
            component.toggleMutePlayer(mockedPlayer);
            expect(gameServiceSpy.toggleMutePlayer).toHaveBeenCalledWith(mockedPlayer);
        });
    });

    describe('getPlayers', () => {
        it('should return an array of player names', () => {
            spyOn(component, 'getPlayerArray').and.returnValue(mockedPlayers);
            const playerNames = component.getPlayers();
            expect(playerNames).toEqual(['Alice', 'Bob']);
        });
    });

    describe('rateAnswerQRL', () => {
        it('should call rateAnswerQRL on OrganisatorService with the correct parameters', () => {
            component.currentRating = 'Excellent';
            const playerName = 'Alice';

            component.rateAnswerQRL(playerName);
            expect(organisatorServiceSpy.rateAnswerQRL).toHaveBeenCalledWith(playerName, 'Excellent');
        });
    });

    describe('sendRating', () => {
        it('should call sendRating on OrganisatorService with the correct player name and reset currentRating', () => {
            const playerName = 'Alice';
            component.currentRating = 'Good';
            component.sendRating(playerName);

            expect(organisatorServiceSpy.sendRating).toHaveBeenCalledWith(playerName);
            expect(component.currentRating).toBe('');
        });
    });

    describe('getRatingForPlayer', () => {
        it('should return the correct rating for a given player', () => {
            const mockRatings = new Map<string, number>([
                ['Alice', 95],
                ['Bob', 88],
            ]);
            spyOn(component, 'getPlayerRatings').and.returnValue(mockRatings);
            const rating = component.getRatingForPlayer('Alice');
            expect(rating).toEqual(95);
        });

        it('should return undefined if the player is not found in the ratings map', () => {
            const rating = component.getRatingForPlayer('Charlie');
            expect(rating).toBeUndefined();
        });
    });

    describe('formatColumn', () => {
        it('should format numeric text as a percentage string', () => {
            const column: ChoiceData = { text: '0.1234', amount: 123, isCorrect: true };
            const formattedText = component.formatColumn(column);
            expect(formattedText).toEqual('12%');
        });

        it('should handle large numbers correctly', () => {
            const column: ChoiceData = { text: '1.0', amount: 1000, isCorrect: false };
            const formattedText = component.formatColumn(column);
            expect(formattedText).toEqual('100%');
        });

        it('should handle very small numbers', () => {
            const column: ChoiceData = { text: '0.001', amount: 1, isCorrect: true };
            const formattedText = component.formatColumn(column);
            expect(formattedText).toEqual('0%');
        });

        it('should return "NaN%" for non-numeric inputs', () => {
            const column: ChoiceData = { text: 'abc', amount: 0, isCorrect: false };
            const formattedText = component.formatColumn(column);
            expect(formattedText).toEqual('NaN%');
        });
    });

    describe('getAnswerAmount', () => {
        it('should return the count of players with confirmed answers', () => {
            gameServiceSpy.filterPlayers.and.returnValue(mockedPlayers);
            const confirmedCount = component.getAnswerAmount();
            expect(confirmedCount).toEqual(2);
        });

        it('should return zero when no players have confirmed answers', () => {
            const mockedPlayersV2: PlayerClient[] = [
                {
                    name: 'Alice',
                    role: GameRole.Player,
                    score: 10,
                    isExcluded: false,
                    hasGiveUp: false,
                    answers: {
                        answer: [0, 1],
                        hasInterracted: true,
                        hasConfirmed: false,
                    },
                    isMuted: false,
                    interactionStatus: InteractionStatus.interacted,
                },
                {
                    name: 'Bob',
                    role: GameRole.Player,
                    score: 15,
                    isExcluded: true,
                    hasGiveUp: true,
                    answers: {
                        answer: [0, 1],
                        hasInterracted: true,
                        hasConfirmed: false,
                    },
                    isMuted: true,
                    interactionStatus: InteractionStatus.interacted,
                },
            ];
            gameServiceSpy.filterPlayers.and.returnValue(mockedPlayersV2);
            const confirmedCount = component.getAnswerAmount();
            expect(confirmedCount).toBe(0);
        });
    });

    describe('calculatePercentage', () => {
        beforeEach(() => {
            spyOn(component, 'getChoices').and.returnValue([
                { text: 'Choice 1', amount: 100, isCorrect: true },
                { text: 'Choice 2', amount: 200, isCorrect: false },
                { text: 'Choice 3', amount: 700, isCorrect: true },
            ]);
        });
        it('should calculate the correct percentage for a given amount', () => {
            const testAmount = 100;
            const expectedPercentage = testAmount / 1000;

            const percentage = component.calculatePercentage(testAmount);
            expect(percentage).toEqual(expectedPercentage);
        });
    });
});
