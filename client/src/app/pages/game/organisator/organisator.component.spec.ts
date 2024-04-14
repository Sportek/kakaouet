/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameService } from '@app/services/game/game.service';
import { OrganisatorService } from '@app/services/organisator/organisator.service';
import { PlayerService } from '@app/services/player/player.service';
import { ActualQuestion, ChoiceData, InteractionStatus, PlayerClient } from '@common/game-types';
import { GameRole, QuestionType } from '@common/types';
import { BehaviorSubject } from 'rxjs';
import { OrganisatorComponent } from './organisator.component';

describe('OrganisatorComponent', () => {
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
        gameServiceSpy = jasmine.createSpyObj('GameService', ['filterPlayers', 'toggleMutePlayer', 'isLastQuestion']);
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['sortPlayers']);
        organisatorServiceSpy = jasmine.createSpyObj(
            'OrganisatorService',
            ['filterPlayers', 'rateAnswerQRL', 'sendRating', 'calculateChoices', 'toggleTimer', 'speedUpTimer', 'nextQuestion'],
            {
                choices: mockedChoices,
                actualQuestion: mockedActualQuestion,
                players: mockedPlayers,
                currentPlayer: mockedCurrentPlayer,
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
});
