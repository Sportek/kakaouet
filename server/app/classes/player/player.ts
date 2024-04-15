import { GameSession } from '@app/classes/game/game-session';
import { Room } from '@app/classes/room/room';
import { CompletePlayerAnswer, GameEvents, PlayerAnswers } from '@common/game-types';
import { GameRole } from '@common/types';
import { Socket } from 'socket.io';
export class Player {
    name: string;
    role: GameRole;
    socket: Socket;
    bonus: number;
    score: number;
    currentQuestionMultiplier: number;
    isExcluded: boolean;
    isMuted: boolean;
    hasGiveUp: boolean;
    hasAnswered: boolean;
    private room: Room;
    private game: GameSession;
    private answers: PlayerAnswers;

    constructor(name: string, socket: Socket, role: GameRole = GameRole.Player) {
        this.name = name;
        this.role = role;
        this.socket = socket;
        this.answers = [];
        this.score = 0;
        this.bonus = 0;
        this.hasGiveUp = false;
        this.hasAnswered = false;
    }

    setRoom(room: Room): void {
        this.room = room;
        this.game = room.getGame();
    }

    confirmAnswer(): void {
        const questionIndex = this.game.gameQuestionIndex;
        this.answers[questionIndex].hasConfirmed = true;
        this.answers[questionIndex].hasConfirmedAt = new Date();
    }

    setAnswer(answer: string | number[]): void {
        const questionIndex = this.game.gameQuestionIndex;
        const answerData = { hasInterracted: true, hasConfirmed: false, answer };
        this.answers[questionIndex] = answerData;
        this.room.sendToOrganizer(GameEvents.PlayerSelectAnswer, { name: this.name, answer: answerData.answer });
    }

    setEmptyAnswer(): void {
        const questionIndex = this.game.gameQuestionIndex;
        const answerData = { hasInterracted: true, hasConfirmed: false, answer: '' };
        this.answers[questionIndex] = answerData;
        this.room.sendToOrganizer(GameEvents.PlayerConfirmEmptyAnswersQRL, { name: this.name, answer: answerData.answer });
    }

    getAnswer(index: number): CompletePlayerAnswer {
        return this.answers[index];
    }

    send(event: string, ...args: unknown[]): void {
        this.socket.emit(event, ...args);
    }

    on(event: string, callback: (...args: unknown[]) => void): void {
        this.socket.on(event, callback);
    }

    off(event: string, callback: (...args: unknown[]) => void): void {
        this.socket.off(event, callback);
    }

    joinRoom(room: string): void {
        this.socket.join(room);
    }

    leaveRoom(room: string): void {
        this.socket.leave(room);
    }

    leaveAllRooms(): void {
        this.socket.rooms.forEach((room) => {
            if (room !== this.socket.id) this.socket.leave(room);
        });
    }
}
