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
            const simpleDelaySpy = jest.spyOn(gameSession as any, 'simpleDelay');
            gameSession.startQuestionCooldown();
            expect(simpleDelaySpy).not.toHaveBeenCalled();
        });

        /*it('calls simpleDelay with quiz duration and eventually calls displayQuestionResults', () => {
            gameSession.gameState = GameState.PlayersAnswerQuestion; // Ensure correct state

            const simpleDelaySpy = jest.spyOn(gameSession as any, 'simpleDelay');

            simpleDelaySpy.mockImplementation((duration, callback: () => void) => {
                callback(); 
            });

            const displayQuestionResultsSpy = jest.spyOn(gameSession, 'displayQuestionResults');
        
            gameSession.startQuestionCooldown();
        
            expect(simpleDelaySpy).toHaveBeenCalledWith(gameSession.quiz.duration, expect.any(Function));
            expect(displayQuestionResultsSpy).toHaveBeenCalled();
        });*/
    });

    
    describe('displayQuestionResults', () => {
        /*it('changes the game state to DisplayQuestionResults', () => {
            const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState');
            gameSession.displayQuestionResults();
            expect(changeGameStateSpy).toHaveBeenCalledWith(GameState.DisplayQuestionResults);
        });

        it('calls sendScores', () => {
            const sendScoresSpy = jest.spyOn(gameSession as any, 'sendScores');

            gameSession.displayQuestionResults();
            expect(sendScoresSpy).toHaveBeenCalled();
        });

        it('calls sendScores', () => {
            const sendScoresSpy = jest.spyOn(gameSession as any, 'sendScores');

            gameSession.displayQuestionResults();
            expect(sendScoresSpy).toHaveBeenCalled();
        });
        
        it('calls nextQuestion if the game type is Test', () => {
            gameSession.type = GameType.Test; 
            const nextQuestionSpy = jest.spyOn(gameSession, 'nextQuestion');
            gameSession.displayQuestionResults();
            expect(nextQuestionSpy).toHaveBeenCalled();
        });
        
        it('does not call nextQuestion if the game type is not Test', () => {
            gameSession.type = GameType.Default; 
            const nextQuestionSpy = jest.spyOn(gameSession, 'nextQuestion');
            gameSession.displayQuestionResults();
            expect(nextQuestionSpy).not.toHaveBeenCalled();
        });*/
    
    });

    it('does nothing if gameState is not DisplayQuestionResults', () => {
        gameSession.gameState = GameState.WaitingPlayers; // Set to a different state
        gameSession.nextQuestion();
        expect(gameSession.changeGameState).not.toHaveBeenCalled();
    });
    
    it('calls displayResults if on the last question', () => {
        gameSession.gameQuestionIndex = gameSession.quiz.questions.length - 1; // Set to last question
        gameSession.nextQuestion();
        expect(gameSession.displayResults).toHaveBeenCalled();
    });
    

    /*it('processes the next question correctly', () => {
        gameSession.gameQuestionIndex = 0; // Ensure not the last question
        gameSession.nextQuestion();
        
        jest.advanceTimersByTime(NEXT_QUESTION_DELAY);
    
        expect(gameSession.simpleDelay).toHaveBeenCalledWith(NEXT_QUESTION_DELAY, expect.any(Function));
        expect(gameSession.changeGameState).toHaveBeenCalledWith(GameState.PlayersAnswerQuestion);
        expect(gameSession.broadcastGameNextQuestion).toHaveBeenCalled();
        expect(gameSession.startQuestionCooldown).toHaveBeenCalled();
    });*/
    
});
