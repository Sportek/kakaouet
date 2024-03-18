import { Room } from '@app/classes/room';
import { GameService } from '@app/services/game/game.service';
import { GameType } from '@common/game-types';
import { QuestionType, Quiz } from '@common/types';
import { Server } from 'socket.io';
import { GameSession } from './game-session';

describe('GameSession', () => {
    let gameSession: GameSession;
    let room: Room;
    let quiz: Quiz;
    const START_GAME_DELAY = 5;
    // const NEXT_QUESTION_DELAY = 3;

    beforeEach(() => {
        // Mock Server and GameService for testing purposes
        const mockServer = {} as Server;
        const mockGameService = {} as GameService;
        room = new Room('test-room', mockServer, mockGameService);
        quiz = {
            _id: 'quiz123',
            name: 'Test Quiz',
            duration: 60,
            description: 'A quiz for testing',
            visibility: true,
            questions: [
                {
                    _id: 'question1',
                    label: 'Test Question',
                    type: QuestionType.QCM,
                    points: 5,
                    choices: [{ _id: 1, label: 'Choice 1', isCorrect: true }],
                    createdAt: new Date(),
                    lastModification: new Date(),
                },
                {
                    _id: 'question2',
                    label: 'Test Question 2',
                    type: QuestionType.QCM,
                    points: 5,
                    choices: [{ _id: 1, label: 'Choice 2', isCorrect: true }],
                    createdAt: new Date(),
                    lastModification: new Date(),
                },
            ],
            createdAt: new Date(),
            lastModification: new Date(),
        };
        gameSession = new GameSession('game123', room, quiz, GameType.Default);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    /* describe('startGameDelayed', () => {
        it('should start the game immediately for a Test game type', () => {
            gameSession.type = GameType.Test;
            const startGameSpy = jest.spyOn(gameSession, 'startGame');
            gameSession.startGameDelayed();
            expect(startGameSpy).toHaveBeenCalledTimes(1);
        });

        it('should delay the game start for non-Test game types', () => {
            gameSession.type = GameType.Default;
            const startGameSpy = jest.spyOn(gameSession, 'startGame');
            jest.useFakeTimers();
            gameSession.startGameDelayed();
            // eslint-disable-next-line no-undef, @typescript-eslint/no-magic-numbers
            jest.advanceTimersByTime(START_GAME_DELAY * 1000);
            expect(startGameSpy).toHaveBeenCalledTimes(1);
            jest.useRealTimers();
        });

        it('should not start the game if the game state is not WaitingPlayers', () => {
            gameSession.gameState = GameState.End;
            const startGameSpy = jest.spyOn(gameSession, 'startGame');
            gameSession.startGameDelayed();
            expect(startGameSpy).not.toHaveBeenCalled();
        });
    });*/

    /* describe('startGame', () => {
        it('should change game state to PlayersAnswerQuestion and broadcast the first question', () => {
            const broadcastSpy = jest.spyOn(room, 'broadcast');
            gameSession.startGame();
            expect(gameSession.gameState).toBe(GameState.PlayersAnswerQuestion);
            expect(broadcastSpy).toHaveBeenCalledWith(
                GameEvents.GameQuestion,
                {},
                { actualQuestion: { question: quiz.questions[0], totalQuestion: quiz.questions.length, actualIndex: 0 } },
            );
        });
    });*/

    // Add tests for other methods as needed
});
