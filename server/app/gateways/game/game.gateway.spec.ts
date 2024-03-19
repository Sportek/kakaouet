/* eslint-disable max-classes-per-file */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-empty-function */
import { GameSession } from '@app/classes/game/game-session';
import { GameService } from '@app/services/game/game.service';
import { Answer, GameEvents } from '@common/game-types';
import { GameRole, GameState, GameType } from '@common/types';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { GameGateway } from './game.gateway';

class MockGameService {
    getGameSessionBySocketId() {}

    getGameSessionByCode() {}

    createGameSession() {}

    removeGameSession() {}
}

describe('GameGateway', () => {
    let gateway: GameGateway;
    let mockGameService: GameService;
    const mockClient = {
        emit: jest.fn(),
        id: 'clientSocketId',
    } as unknown as Socket;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameGateway, { provide: GameService, useClass: MockGameService }],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        mockGameService = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('GameGateway - handleDisconnect', () => {
        let gateway: GameGateway;
        let mockGameService: GameService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [GameGateway, { provide: GameService, useClass: MockGameService }],
            }).compile();

            gateway = module.get<GameGateway>(GameGateway);
            mockGameService = module.get<GameService>(GameService);
        });

        it('should return failure if game session does not exist', () => {
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(undefined);

            const client = { id: 'testSocketId' } as Socket;
            const response = gateway.handleDisconnect(client);

            expect(response).toEqual({ isSuccess: false, message: "La partie n'existe pas" });
        });

        it('should return failure if player is not found or is excluded', () => {
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue(null),
                },
            } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

            const client = { id: 'testSocketId' } as Socket;
            const response = gateway.handleDisconnect(client);

            expect(response).toEqual({ isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" });
        });

        it('should remove player and return success if game is waiting for players', () => {
            const mockSession = {
                gameState: GameState.WaitingPlayers,
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue({ name: 'JohnDoe', isExcluded: false }),
                    removePlayer: jest.fn(),
                },
            } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

            const client = { id: 'testSocketId' } as Socket;
            const response = gateway.handleDisconnect(client);

            expect(response).toEqual({ isSuccess: true, message: 'Vous avez quitté la partie' });
            expect(mockSession.room.removePlayer).toHaveBeenCalledWith('JohnDoe');
        });

        it('should abandon player', () => {
            const mockSession = {
                gameState: GameState.DisplayQuestionResults,
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue({ name: 'JohnDoe', isExcluded: false }),
                    giveUpPlayer: jest.fn(),
                },
            } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

            const client = { id: 'testSocketId' } as Socket;
            const response = gateway.handleDisconnect(client);

            expect(response).toEqual({ isSuccess: true, message: 'Vous avez abandonné la partie' });
            expect(mockSession.room.giveUpPlayer).toHaveBeenCalledWith('JohnDoe');
        });

        it('should return failure if game session does not exist', () => {
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(undefined);

            const client = { id: 'testSocketId' } as Socket;
            const data = { answers: ['A', 'B'] as unknown as Answer }; // Mock data structure
            const response = gateway.handleSelectAnswer(data, client);

            expect(response).toEqual({ isSuccess: false, message: "La partie n'existe pas" });
        });

        it('should return failure if player is not found', () => {
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue(null),
                },
            } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

            const client = { id: 'testSocketId' } as Socket;
            const data = { answers: ['C'] as unknown as Answer };
            const response = gateway.handleSelectAnswer(data, client);

            expect(response).toEqual({ isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" });
        });

        it('should return success and record the answer for a valid player and game session', () => {
            const playerMock = {
                setAnswer: jest.fn(),
            };
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue(playerMock),
                },
            } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

            const client = { id: 'testSocketId' } as Socket;
            const data = { answers: ['D'] as unknown as Answer };
            const response = gateway.handleSelectAnswer(data, client);

            expect(response).toEqual({ isSuccess: true, message: 'Réponse enregistrée' });
            expect(playerMock.setAnswer).toHaveBeenCalledWith(data.answers);
        });
    });

    it('should return failure if game session does not exist', () => {
        jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(undefined);

        const client = { id: 'testSocketId' } as Socket;
        const response = gateway.handleConfirmAnswers(client);

        expect(response).toEqual({ isSuccess: false, message: "La partie n'existe pas" });
    });

    it('should return failure if player is not found', () => {
        const mockSession = {
            room: {
                getPlayerWithSocketId: jest.fn().mockReturnValue(null),
            },
        } as unknown as GameSession;
        jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

        const client = { id: 'testSocketId' } as Socket;
        const response = gateway.handleConfirmAnswers(client);

        expect(response).toEqual({ isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" });
    });

    it('should notify organizer and stop timer when all players have answered', () => {
        const playerMock = {
            name: 'JohnDoe',
            confirmAnswer: jest.fn(),
        };
        const roomMock = {
            getPlayerWithSocketId: jest.fn().mockReturnValue(playerMock),
            sendToOrganizer: jest.fn(),
            allPlayerAnswered: jest.fn().mockReturnValue(true),
        };
        const gameSessionMock = {
            room: roomMock,
            timer: {
                stop: jest.fn(),
            },
        } as unknown as GameSession;
        jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(gameSessionMock);

        const client = { id: 'testSocketId' } as Socket;
        const response = gateway.handleConfirmAnswers(client);

        expect(response).toEqual({ isSuccess: true, message: 'Réponse confirmée' });
        expect(playerMock.confirmAnswer).toHaveBeenCalled();
        expect(gameSessionMock.timer.stop).toHaveBeenCalled();
    });

    it('should notify client if no game session exists', () => {
        jest.spyOn(mockGameService, 'getGameSessionByCode').mockReturnValue(undefined);

        const data = { code: 'invalidCode', name: 'JohnDoe' };
        gateway.handleJoinGame(data, mockClient);

        expect(mockClient.emit).toHaveBeenCalledWith(GameEvents.PlayerConfirmJoinGame, {
            code: data.code,
            isSuccess: false,
            message: "La partie n'existe pas",
        });
    });

    it('should notify client if game session is locked', () => {
        const mockSession = { isLocked: true } as unknown as GameSession;
        jest.spyOn(mockGameService, 'getGameSessionByCode').mockReturnValue(mockSession);

        const data = { code: 'lockedCode', name: 'JohnDoe' };
        gateway.handleJoinGame(data, mockClient as Socket);

        expect(mockClient.emit).toHaveBeenCalledWith(GameEvents.PlayerConfirmJoinGame, {
            code: data.code,
            isSuccess: false,
            message: 'La partie est vérouillée',
        });
    });

    it('should add new player if name is unique and game is not locked', () => {
        const addPlayerMock = jest.fn();
        const mockSession = {
            isLocked: false,
            room: {
                getPlayer: jest.fn().mockReturnValue(null),
                addPlayer: addPlayerMock,
            },
        } as unknown as GameSession;
        jest.spyOn(mockGameService, 'getGameSessionByCode').mockReturnValue(mockSession);

        const data = { code: 'validCode', name: 'NewPlayer' };
        const response = gateway.handleJoinGame(data, mockClient as Socket);

        expect(response).toEqual({ isSuccess: true });
        expect(addPlayerMock).toHaveBeenCalled();
    });

    it('should notify client if player is banned', () => {
        const mockPlayer = { isExcluded: true };
        const mockSession = {
            isLocked: false,
            room: {
                getPlayer: jest.fn().mockReturnValue(mockPlayer),
            },
        } as unknown as GameSession;
        jest.spyOn(mockGameService, 'getGameSessionByCode').mockReturnValue(mockSession);

        const data = { code: 'validCode', name: 'BannedPlayer' };
        gateway.handleJoinGame(data, mockClient as Socket);

        expect(mockClient.emit).toHaveBeenCalledWith(GameEvents.PlayerConfirmJoinGame, {
            code: data.code,
            isSuccess: false,
            message: 'Ce pseudonyme est banni de la partie',
        });
    });

    it('should notify client if name is already taken', () => {
        const mockPlayer = { isExcluded: false };
        const mockSession = {
            isLocked: false,
            room: {
                getPlayer: jest.fn().mockReturnValue(mockPlayer),
            },
        } as unknown as GameSession;
        jest.spyOn(mockGameService, 'getGameSessionByCode').mockReturnValue(mockSession);

        const data = { code: 'validCode', name: 'ExistingPlayer' };
        gateway.handleJoinGame(data, mockClient as Socket);

        expect(mockClient.emit).toHaveBeenCalledWith(GameEvents.PlayerConfirmJoinGame, {
            code: data.code,
            isSuccess: false,
            message: 'Ce nom est déjà pris',
        });
    });

    it('should successfully create a game session and add an organizer', async () => {
        const mockAddPlayer = jest.fn();
        const mockGameSession = {
            room: {
                addPlayer: mockAddPlayer,
            },
        } as unknown as GameSession;

        jest.spyOn(mockGameService, 'createGameSession').mockResolvedValue(mockGameSession);

        const data = { code: 'newGameCode', quizId: 'quiz123', gameType: GameType.Default };
        const response = await gateway.handleCreateGame(data, mockClient as Socket);

        expect(response).toEqual({ isSuccess: true, message: 'Partie créée' });
        expect(mockGameService.createGameSession).toHaveBeenCalledWith(data.code, null, data.quizId, data.gameType);
        expect(mockAddPlayer).toHaveBeenCalledWith(expect.anything());
    });

    describe('GameGateway - handleStartGame', () => {
        let gateway: GameGateway;
        let mockGameService: GameService;
        let mockClient: Partial<Socket>;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [GameGateway, { provide: GameService, useClass: MockGameService }],
            }).compile();

            gateway = module.get<GameGateway>(GameGateway);
            mockGameService = module.get<GameService>(GameService);
            mockClient = {
                id: 'clientSocketId',
            };
        });

        it('should return failure if player is not found', () => {
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue(null),
                },
                startGameDelayed: jest.fn(),
            } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

            const response = gateway.handleStartGame(mockClient as Socket);

            expect(response).toEqual({ isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" });
            expect(mockSession.startGameDelayed).not.toHaveBeenCalled();
        });

        it('should start the game successfully for a valid player', () => {
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue({}),
                },
                startGameDelayed: jest.fn(),
            } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

            const response = gateway.handleStartGame(mockClient as Socket);

            expect(response).toEqual({ isSuccess: true, message: 'Partie démarrée' });
            expect(mockSession.startGameDelayed).toHaveBeenCalled();
        });
    });

    describe('GameGateway - handleGameClosed', () => {
        let gateway: GameGateway;
        let mockGameService: GameService;
        let mockClient: Partial<Socket>;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [GameGateway, { provide: GameService, useClass: MockGameService }],
            }).compile();

            gateway = module.get<GameGateway>(GameGateway);
            mockGameService = module.get<GameService>(GameService);
            mockClient = {
                id: 'clientSocketId',
            };
        });

        it('should return failure if no game session exists', () => {
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(undefined);

            const response = gateway.handleGameClosed(mockClient as Socket);

            expect(response).toEqual({ isSuccess: false, message: "La partie n'existe pas" });
        });

        it('should close the game session successfully', () => {
            const mockSession = { code: 'gameCode' } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);
            const removeGameSessionSpy = jest.spyOn(mockGameService, 'removeGameSession').mockImplementation(() => {});

            const response = gateway.handleGameClosed(mockClient as Socket);

            expect(response).toEqual({ isSuccess: true, message: 'Partie fermée' });
            expect(removeGameSessionSpy).toHaveBeenCalledWith(mockSession.code);
        });
    });

    describe('GameGateway - handleChangeLockState', () => {
        let gateway: GameGateway;
        let mockGameService: GameService;
        let mockClient: Partial<Socket>;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [GameGateway, { provide: GameService, useClass: MockGameService }],
            }).compile();

            gateway = module.get<GameGateway>(GameGateway);
            mockGameService = module.get<GameService>(GameService);
            mockClient = {
                id: 'clientSocketId',
            };
        });

        it('should return failure if no player is found', () => {
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue(null),
                },
                changeGameLockState: jest.fn(),
            } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

            const response = gateway.handleChangeLockState(mockClient as Socket);

            expect(response).toEqual({ isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" });
            expect(mockSession.changeGameLockState).not.toHaveBeenCalled();
        });

        it('should successfully change the game lock state for a valid player', () => {
            const changeGameLockStateSpy = jest.fn();
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue({}),
                },
                changeGameLockState: changeGameLockStateSpy,
            } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

            const response = gateway.handleChangeLockState(mockClient as Socket);

            expect(response).toEqual({ isSuccess: true, message: 'Verrouillage de la partie modifié' });
            expect(changeGameLockStateSpy).toHaveBeenCalled();
        });
    });

    describe('GameGateway - handleNextQuestion', () => {
        let gateway: GameGateway;
        let mockGameService: GameService;
        let mockClient: Partial<Socket>;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [GameGateway, { provide: GameService, useClass: MockGameService }],
            }).compile();

            gateway = module.get<GameGateway>(GameGateway);
            mockGameService = module.get<GameService>(GameService);
            mockClient = {
                id: 'clientSocketId',
            };
        });

        it('should return failure if the player is not found or not an organizer', () => {
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue(null),
                },
                nextQuestion: jest.fn(),
            } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

            const response = gateway.handleNextQuestion(mockClient as Socket);

            expect(response).toEqual({ isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" });
            expect(mockSession.nextQuestion).not.toHaveBeenCalled();
            mockSession.room.getPlayerWithSocketId = jest.fn().mockReturnValue({ role: GameRole.Player });
            const responseNotOrganizer = gateway.handleNextQuestion(mockClient as Socket);

            expect(responseNotOrganizer).toEqual({ isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" });
            expect(mockSession.nextQuestion).not.toHaveBeenCalled();
        });

        it('should successfully advance to the next question for an organizer', () => {
            const nextQuestionSpy = jest.fn();
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue({ role: GameRole.Organisator }),
                },
                nextQuestion: nextQuestionSpy,
            } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

            const response = gateway.handleNextQuestion(mockClient as Socket);

            expect(response).toEqual({ isSuccess: true, message: 'Question suivante' });
            expect(nextQuestionSpy).toHaveBeenCalled();
        });
    });

    describe('GameGateway - handleBanPlayer', () => {
        let gateway: GameGateway;
        let mockGameService: GameService;
        let mockClient: Partial<Socket>;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [GameGateway, { provide: GameService, useClass: MockGameService }],
            }).compile();

            gateway = module.get<GameGateway>(GameGateway);
            mockGameService = module.get<GameService>(GameService);
            mockClient = {
                id: 'clientSocketId',
            };
        });

        it('should return failure if the player is not found or not an organizer', () => {
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue(null),
                    banPlayer: jest.fn(),
                },
            } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

            const data = { name: 'PlayerToBan' };
            const response = gateway.handleBanPlayer(data, mockClient as Socket);

            expect(response).toEqual({ isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" });
            expect(mockSession.room.banPlayer).not.toHaveBeenCalled();
            mockSession.room.getPlayerWithSocketId = jest.fn().mockReturnValue({ role: GameRole.Player });
            const responseNotOrganizer = gateway.handleBanPlayer(data, mockClient as Socket);

            expect(responseNotOrganizer).toEqual({ isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" });
            expect(mockSession.room.banPlayer).not.toHaveBeenCalled();
        });

        it('should successfully ban a player when requested by an organizer', () => {
            const banPlayerSpy = jest.fn();
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue({ role: GameRole.Organisator }),
                    banPlayer: banPlayerSpy,
                },
            } as unknown as GameSession;
            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

            const data = { name: 'PlayerToBan' };
            const response = gateway.handleBanPlayer(data, mockClient as Socket);

            expect(response).toEqual({ isSuccess: true, message: 'Joueur banni' });
            expect(banPlayerSpy).toHaveBeenCalledWith(data.name);
        });
    });

    describe('GameGateway - handleToggleTimer', () => {
        it('should prevent toggleTimer', () => {
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue({ role: GameRole.Organisator }),
                },
                toggleTimer: jest.fn(),
            } as unknown as GameSession;

            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);
            // @ts-ignore
            jest.spyOn(gateway, 'hasAutorisation').mockReturnValue(false);

            const result = gateway.handleToggleTimer(mockClient as Socket);
            expect(result).toEqual({ isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" });
        });

        it('should toggle timer', () => {
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue({ role: GameRole.Organisator }),
                },
                toggleTimer: jest.fn(),
            } as unknown as GameSession;

            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);
            // @ts-ignore
            jest.spyOn(gateway, 'hasAutorisation').mockReturnValue(true);

            const result = gateway.handleToggleTimer(mockClient as Socket);

            expect(mockSession.toggleTimer).toHaveBeenCalled();
            expect(result).toEqual({ isSuccess: true, message: 'Timer modifié' });
        });
    });

    describe('GameGateway - handleSpeedUpTimer', () => {
        it('should prevent speedUpTimer', () => {
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue({ role: GameRole.Organisator }),
                },
                speedUpTimer: jest.fn(),
            } as unknown as GameSession;

            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);
            // @ts-ignore
            jest.spyOn(gateway, 'hasAutorisation').mockReturnValue(false);

            const result = gateway.handleSpeedUpTimer(mockClient as Socket);
            expect(result).toEqual({ isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" });
        });

        it('should toggle timer', () => {
            const mockSession = {
                room: {
                    getPlayerWithSocketId: jest.fn().mockReturnValue({ role: GameRole.Organisator }),
                },
                speedUpTimer: jest.fn(),
            } as unknown as GameSession;

            jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);
            // @ts-ignore
            jest.spyOn(gateway, 'hasAutorisation').mockReturnValue(true);

            const result = gateway.handleSpeedUpTimer(mockClient as Socket);

            expect(mockSession.speedUpTimer).toHaveBeenCalled();
            expect(result).toEqual({ isSuccess: true, message: 'Timer accéléré' });
        });
    });

    it('should broadcast message to room', () => {
        const mockSession = {
            room: {
                getPlayerWithSocketId: jest.fn().mockReturnValue({ role: GameRole.Organisator }),
            },
            broadcastMessage: jest.fn(),
        } as unknown as GameSession;
        jest.spyOn(mockGameService, 'getGameSessionBySocketId').mockReturnValue(mockSession);

        const result = gateway.handleMessageSent({ content: 'Allo' }, mockClient as Socket);

        expect(mockSession.broadcastMessage).toHaveBeenCalled();
        expect(result).toEqual({ isSuccess: true, message: 'Message envoyé' });
    });
});
