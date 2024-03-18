import { Room } from '@app/classes/room';
import { GameService } from '@app/services/game/game.service';
import { GameType } from '@common/game-types';
import { GameState, QuestionType, Quiz } from '@common/types';
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

    describe('GameSession.constructor', () => {
        it('initializes correctly', () => {
            expect(gameSession.gameState).toBe(GameState.WaitingPlayers);
            expect(gameSession.room).toBe(room);
            expect(gameSession.quiz).toBe(quiz);
            // Verify room.setGame was called with 'gameSession'
        });
    });

    describe('startQuestionCooldown', () => {
        it('does nothing if gameState is not PlayersAnswerQuestion', () => {
            gameSession.gameState = GameState.WaitingPlayers; // Set to a different state
            // Assuming simpleDelay is not recognized by TypeScript in the context of GameSession
            const simpleDelaySpy = jest.spyOn(gameSession as any, 'simpleDelay');

        
            gameSession.startQuestionCooldown();
        
            expect(simpleDelaySpy).not.toHaveBeenCalled();
        });
    });


});
