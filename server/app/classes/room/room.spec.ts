/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-var-requires */
import { GameEvents } from '@common/game-types';
import { GameRole, GameType, Quiz } from '@common/types';

import { Server } from 'socket.io';

jest.mock('@nestjs/common', () => ({
    Logger: jest.fn().mockReturnValue({
        log: jest.fn(),
        error: jest.fn(),
    }),
}));

jest.mock('@app/services/game/game.service', () => ({
    GameService: jest.fn().mockImplementation(() => ({
        removeGameSession: jest.fn(),
    })),
}));

jest.mock('socket.io', () => {
    const originalModule = jest.requireActual('socket.io');
    return {
        __esModule: true,
        ...originalModule,

        Server: jest.fn(() => ({
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            except: jest.fn().mockReturnThis(),
        })),
    };
});

const mockSocket = {
    id: 'mockSocketId',
    emit: jest.fn(),
    on: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    rooms: new Set(),
};

class MockPlayer {
    name;
    role = GameRole.Player;
    isExcluded = false;
    hasGiveUp = false;
    score = 0;
    socket;
    lastMessageSent;

    constructor(name, socket) {
        this.name = name;
        this.socket = socket;
    }

    leaveAllRooms = jest.fn();
    joinRoom = jest.fn();
    setRoom = jest.fn();
    send = jest.fn((event, data) => {
        this.lastMessageSent = { event, data };
    });
    leaveRoom = jest.fn();
    getAnswer = jest.fn().mockReturnValue(false);
}

import { GameSession } from '@app/classes/game/game-session';
import { Room } from './room';

describe('Room', () => {
    let room;
    let mockServer;
    let mockGameService;
    let mockGameSession;
    const roomCode = 'TEST123';
    const mockQuiz: Quiz = {
        _id: 'mockQuizId',
        name: 'Mock Quiz',
        description: 'A mock quiz for testing',
        duration: 30,
        visibility: true,
        questions: [],
        createdAt: new Date(),
        lastModification: new Date(),
    };

    beforeEach(() => {
        mockServer = new Server();
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        mockGameService = new (require('@app/services/game/game.service').GameService)();
        room = new Room(roomCode, mockServer, mockGameService);
        mockGameSession = new GameSession(roomCode, room, mockQuiz, GameType.Default);
        room.setGame(mockGameSession);
    });

    it('should add a player correctly', () => {
        const mockPlayer = new MockPlayer('TestPlayer', mockSocket);
        room.addPlayer(mockPlayer);

        expect(room.getPlayers()).toContain(mockPlayer);
        expect(mockPlayer.leaveAllRooms).toHaveBeenCalled();
        expect(mockPlayer.joinRoom).toHaveBeenCalledWith(roomCode);
        expect(mockPlayer.setRoom).toHaveBeenCalledWith(room);
        expect(mockPlayer.send).toHaveBeenCalledWith(GameEvents.PlayerConfirmJoinGame, expect.anything());
    });

    it('should remove a player correctly', () => {
        const mockPlayer = new MockPlayer('TestPlayer', mockSocket);
        room.addPlayer(mockPlayer);
        room.removePlayer('TestPlayer');

        expect(room.getPlayers()).not.toContain(mockPlayer);
        expect(mockPlayer.leaveAllRooms).toHaveBeenCalled();
    });

    it('should ban a player correctly', () => {
        const mockPlayer = new MockPlayer('BanPlayer', mockSocket);
        room.addPlayer(mockPlayer);
        room.banPlayer('BanPlayer');

        expect(mockPlayer.isExcluded).toBeTruthy();
    });

    it('should handle player give up correctly', () => {
        const mockPlayer = new MockPlayer('GiveUpPlayer', mockSocket);
        room.addPlayer(mockPlayer);
        room.giveUpPlayer('GiveUpPlayer');

        expect(mockPlayer.hasGiveUp).toBeTruthy();
    });

    it('should delete the room correctly', () => {
        room.deleteRoom();

        expect(mockGameService.removeGameSession).toHaveBeenCalledWith(roomCode);
    });

    it('sends event to the organizer correctly', () => {
        const mockOrganizer = new MockPlayer('Organizer', mockSocket);
        mockOrganizer.role = GameRole.Organisator;
        room.addPlayer(mockOrganizer);

        room.sendToOrganizer(GameEvents.PlayerConfirmJoinGame, { key: 'value' });

        expect(mockOrganizer.lastMessageSent).toEqual({ event: GameEvents.PlayerConfirmJoinGame, data: { key: 'value' } });
    });

    it('gets players except the organizer', () => {
        const mockPlayer1 = new MockPlayer('Player1', { ...mockSocket, id: 'player1SocketId' });
        const mockOrganizer = new MockPlayer('Organizer', { ...mockSocket, id: 'organizerSocketId' });
        mockOrganizer.role = GameRole.Organisator;
        room.addPlayer(mockPlayer1);
        room.addPlayer(mockOrganizer);

        const result = room.getPlayersExceptOrganizer();
        expect(result).toContain(mockPlayer1);
        expect(result).not.toContain(mockOrganizer);
    });

    it('gets only game players (excluding excluded players)', () => {
        const mockPlayer1 = new MockPlayer('Player1', { ...mockSocket, id: 'player1SocketId' });
        const mockPlayer2 = new MockPlayer('Player2', { ...mockSocket, id: 'player2SocketId' });
        mockPlayer2.isExcluded = true;
        room.addPlayer(mockPlayer1);
        room.addPlayer(mockPlayer2);

        const result = room.getOnlyGamePlayers();
        expect(result).toContain(mockPlayer1);
        expect(result).not.toContain(mockPlayer2);
    });

    it('finds a player by socket ID', () => {
        const mockPlayer1 = new MockPlayer('Player1', { ...mockSocket, id: 'player1SocketId' });
        room.addPlayer(mockPlayer1);

        const result = room.getPlayerWithSocketId('player1SocketId');
        expect(result).toBe(mockPlayer1);
    });

    it('returns the game session', () => {
        const result = room.getGame();
        expect(result).toBe(mockGameSession);
    });

    it('returns true when all players have answered the current question', () => {
        const mockPlayer1 = new MockPlayer('Player1', mockSocket);
        const mockPlayer2 = new MockPlayer('Player2', mockSocket);
        mockPlayer1.getAnswer.mockReturnValue(true);
        mockPlayer2.getAnswer.mockReturnValue(true);

        room.addPlayer(mockPlayer1);
        room.addPlayer(mockPlayer2);

        expect(room.allPlayerAnswered()).toBeTruthy();
    });

    it('returns false when not all players have answered the current question', () => {
        const mockPlayer1 = new MockPlayer('Player1', mockSocket);
        const mockPlayer2 = new MockPlayer('Player2', mockSocket);
        mockPlayer1.getAnswer.mockReturnValue(true);
        mockPlayer2.getAnswer.mockReturnValue(false);

        room.addPlayer(mockPlayer1);
        room.addPlayer(mockPlayer2);

        expect(room.allPlayerAnswered()).toBeFalsy();
    });
});
