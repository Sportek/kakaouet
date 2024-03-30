import { GameSession } from '@app/classes/game/game-session';
import { Room } from '@app/classes/room/room';
import { GameService } from '@app/services/game/game.service';
import { GameRole, GameType, Question, QuestionType, Quiz } from '@common/types';
import { Server, Socket } from 'socket.io';
import { Player } from './player';

describe('Player', () => {
    let player: Player;
    let room: Room;
    let gameSession: GameSession;
    let socketMock: Partial<Socket>;
    let mockserver: Server;
    let mockgameService: GameService;
    const six = 6;
    const quiz: Quiz = {
        title: 'Quiz Héros de la Terre du Milieu',
        duration: 10,
        description: 'Découvrez les héros emblématiques de la saga.',
        visibility: true,
        questions: [
            {
                type: QuestionType.QCM,
                text: 'Quel est le titre donné à Gandalf après sa résurrection ?',
                points: 10,
                choices: [
                    { text: 'Gandalf le Gris', isCorrect: false },
                    { text: 'Gandalf le Blanc', isCorrect: true },
                    { text: 'Gandalf le Noir', isCorrect: false },
                    { text: 'Gandalf le Rouge', isCorrect: false },
                ],
            } as Question,
            {
                type: 'QCM',
                text: 'Quelle est la race de Legolas ?',
                points: 10,
                choices: [
                    { text: 'Nain', isCorrect: false },
                    { text: 'Elfe', isCorrect: true },
                    { text: 'Homme', isCorrect: false },
                    { text: 'Hobbit', isCorrect: false },
                ],
            } as Question,
        ],
        _id: '',
        createdAt: undefined,
        lastModification: undefined,
    };

    beforeEach(() => {
        socketMock = {
            emit: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            join: jest.fn(),
            leave: jest.fn(),
            rooms: new Set('roomCode'),
        };
        room = new Room('roomCode', mockserver, mockgameService);
        gameSession = new GameSession('gameCode', room, quiz, GameType.Default);
        player = new Player('John Doe', socketMock as Socket, GameRole.Player);
    });

    it('should create a player with the correct properties', () => {
        expect(player.name).toBe('John Doe');
        expect(player.role).toBe(GameRole.Player);
        expect(player.socket).toBe(socketMock);
        expect(player.bonus).toBe(0);
        expect(player.score).toBe(0);
    });

    it('should set the room and game session', () => {
        player.setRoom(room);
        expect(player['room']).toBe(room);
        expect(player['game']).toBe(gameSession);
    });

    it('should confirm an answer', () => {
        player.setRoom(room);
        player['answers'][0] = { hasInterracted: true, hasConfirmed: false, answer: 'answer' };
        player.confirmAnswer();
        expect(player['answers'][0].hasConfirmed).toBe(true);
        expect(player['answers'][0].hasConfirmedAt).not.toBeUndefined();
    });

    it('should set an answer', () => {
        player.setRoom(room);
        player.setAnswer('answer');
        expect(player['answers'][0]).toEqual({ hasInterracted: true, hasConfirmed: false, answer: 'answer' });
    });

    it('should get an answer', () => {
        player.setRoom(room);
        player['answers'][0] = { hasInterracted: true, hasConfirmed: false, answer: 'answer' };
        expect(player.getAnswer(0)).toEqual({ hasInterracted: true, hasConfirmed: false, answer: 'answer' });
    });

    it('should send an event', () => {
        player.send('event', 'data');
        expect(socketMock.emit).toHaveBeenCalledWith('event', 'data');
    });

    it('should listen to an event', () => {
        const callback = jest.fn();
        player.on('event', callback);
        expect(socketMock.on).toHaveBeenCalledWith('event', callback);
    });

    it('should stop listening to an event', () => {
        const callback = jest.fn();
        player.on('event', callback);
        player.off('event', callback);
        expect(socketMock.off).toHaveBeenCalledWith('event', callback);
    });

    it('should join a room', () => {
        player.joinRoom('roomCode');
        expect(socketMock.join).toHaveBeenCalledWith('roomCode');
    });

    it('should leave a room', () => {
        player.leaveRoom('roomCode');
        expect(socketMock.leave).toHaveBeenCalledWith('roomCode');
    });

    it('should leave all rooms', () => {
        player.leaveAllRooms();
        expect(socketMock.leave).toHaveBeenCalledTimes(six);
    });

    it('should not leave all rooms', () => {
        const newSocketMock = {
            emit: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            join: jest.fn(),
            leave: jest.fn(),
            rooms: new Set('wrongCode'),
        };
        const newPlayer = new Player('John Doe', newSocketMock as unknown as Socket, GameRole.Player);
        newPlayer.leaveAllRooms();
        expect(socketMock.leave).toHaveBeenCalledTimes(0);
    });

    it('should default to the Player role if none is provided', () => {
        const defaultRolePlayer = new Player('Default Role Player', socketMock as Socket);
        expect(defaultRolePlayer.name).toBe('Default Role Player');
        expect(defaultRolePlayer.role).toBe(GameRole.Player);
        expect(defaultRolePlayer.socket).toBe(socketMock);
    });
});
