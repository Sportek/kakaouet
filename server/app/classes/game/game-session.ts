import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room/room';
import { Timer } from '@app/classes/timer';
import { FIRST_PLAYER_SCORE_MULTIPLICATOR } from '@common/constants';
import { ActualQuestion, ChoiceData, GameEvents, GameEventsData, Score } from '@common/game-types';
import { GameState, GameType, Question, QuestionType, Quiz } from '@common/types';

const START_GAME_DELAY = 5;
const NEXT_QUESTION_DELAY = 3;

export class GameSession {
    code: string;
    quiz: Quiz;
    room: Room;
    timer: Timer;
    gameState: GameState;
    type: GameType;
    gameQuestionIndex: number;
    isLocked: boolean;

    // eslint-disable-next-line max-params -- Ici, on a besoin de tous ces paramètres
    constructor(code: string, room: Room, quiz: Quiz, gameType: GameType) {
        this.gameState = GameState.WaitingPlayers;
        this.gameQuestionIndex = 0;
        this.code = code;
        this.room = room;
        this.quiz = quiz;
        this.isLocked = false;
        this.room.setGame(this);
        this.type = gameType;
    }

    startGameDelayed(): void {
        if (this.gameState !== GameState.WaitingPlayers) return;
        if (this.type === GameType.Test) return this.startGame();

        this.simpleDelay(START_GAME_DELAY, () => {
            this.startGame();
        });
    }

    startGame() {
        this.changeGameState(GameState.PlayersAnswerQuestion);
        this.broadcastGameNextQuestion();
        this.startQuestionCooldown();
    }

    startQuestionCooldown(): void {
        if (this.gameState !== GameState.PlayersAnswerQuestion) return;
        this.simpleDelay(this.quiz.duration, () => {
            this.displayQuestionResults();
        });
    }

    displayQuestionResults(): void {
        this.changeGameState(GameState.DisplayQuestionResults);
        this.sendScores();
        if (this.type === GameType.Test) this.nextQuestion();
    }

    nextQuestion(): void {
        if (this.gameState !== GameState.DisplayQuestionResults) return;
        if (++this.gameQuestionIndex >= this.quiz.questions.length) return this.displayResults();
        this.simpleDelay(NEXT_QUESTION_DELAY, () => {
            this.changeGameState(GameState.PlayersAnswerQuestion);
            this.broadcastGameNextQuestion();
            this.startQuestionCooldown();
        });
    }

    displayResults(): void {
        this.simpleDelay(NEXT_QUESTION_DELAY, () => {
            this.changeGameState(GameState.DisplayQuizResults);
            this.sendResultsToPlayers();
        });
    }

    sendResultsToPlayers(): void {
        if (this.gameState !== GameState.DisplayQuizResults) return;
        const sortedPlayers = this.sortPlayersByScore(this.room.getOnlyGamePlayers());
        const scores = sortedPlayers.map(({ name, score, bonus }) => ({
            name,
            score,
            bonus,
        }));
        this.broadcastPlayerResults(scores, this.calculateCorrectChoices());
    }

    endGame(): void {
        this.changeGameState(GameState.End);
        // TODO: Fermer les différentes connections à la room, delete, sauvegarde, etc : sprint 3.
    }

    changeGameState(gameState: GameState): void {
        this.gameState = gameState;
        this.room.broadcast(GameEvents.GameStateChanged, {}, { gameState: this.gameState });
    }

    changeGameLockState(): void {
        this.isLocked = !this.isLocked;
        this.room.broadcast(GameEvents.GameLockedStateChanged, {}, { isLocked: this.isLocked });
    }

    toggleTimer(): void {
        if (this.timer) this.timer.togglePlayPause();
    }

    speedUpTimer(): void {
        if (this.timer) this.timer.speedUp();
    }

    broadcastMessage(player: Player, content: string): void {
        const newDate: Date = new Date();
        this.room.broadcast(GameEvents.PlayerSendMessage, {}, { name: player.name, content, createdAt: newDate });
    }

    private broadcastCorrectAnswers(question: Question): void {
        if (question.type !== QuestionType.QCM) return;
        const correctAnswers = question.choices.flatMap((choice) => (choice.isCorrect ? choice : []));
        this.room.broadcast(GameEvents.SendCorrectAnswers, {}, { choices: correctAnswers });
    }

    private sortPlayersAnswersByTime(players: Player[]): Player[] {
        return players.sort((playerA, playerB) => {
            const answerA = playerA.getAnswer(this.gameQuestionIndex);
            const answerB = playerB.getAnswer(this.gameQuestionIndex);
            if (!answerA || !answerB) return 0;
            if (answerA.hasConfirmedAt && answerB.hasConfirmedAt) {
                return answerA.hasConfirmedAt.getTime() - answerB.hasConfirmedAt.getTime();
            }
            return 0;
        });
    }

    private filterCorrectAnswerPlayers(players: Player[], correctAnswersIndex: number[], question: Question): Player[] {
        const correctAnswerPlayers: Player[] = players.flatMap((player) => {
            const answer = player.getAnswer(this.gameQuestionIndex);
            if (answer && this.isCorrectAnswer(answer.answer as number[], correctAnswersIndex)) {
                player.score += question.points;
                return player;
            }
            return [];
        });
        return this.sortPlayersAnswersByTime(correctAnswerPlayers);
    }

    private hasMultiplePlayersAnsweredCorrectly(players: Player[]): boolean {
        if (players.length < 2) return false;
        const firstAnswer = players[0].getAnswer(this.gameQuestionIndex);
        const secondAnswer = players[1].getAnswer(this.gameQuestionIndex);
        if (firstAnswer.hasConfirmedAt && secondAnswer.hasConfirmedAt) {
            return firstAnswer.hasConfirmedAt.getTime() === secondAnswer.hasConfirmedAt.getTime();
        }
    }

    private calculateScores(): { player: Player; hasAnsweredFirst: boolean }[] {
        const question = this.quiz.questions[this.gameQuestionIndex];

        // TODO: Je ne gère pas les autres types de questions pour l'instant : Sprint 3
        if (question.type !== QuestionType.QCM) return this.room.players.map((player) => ({ player, hasAnsweredFirst: false }));
        const correctAnswersIndex = question.choices.flatMap((choice, index) => (choice.isCorrect ? index : []));
        this.broadcastCorrectAnswers(question);

        const goodAnswerPlayers = this.filterCorrectAnswerPlayers(this.room.getOnlyGamePlayers(), correctAnswersIndex, question);
        const firstPlayerToAnswer = goodAnswerPlayers[0] || null;
        if (!this.hasMultiplePlayersAnsweredCorrectly(goodAnswerPlayers) && firstPlayerToAnswer) {
            firstPlayerToAnswer.score += question.points * FIRST_PLAYER_SCORE_MULTIPLICATOR;
        }

        return goodAnswerPlayers.map((player) => ({ player, hasAnsweredFirst: firstPlayerToAnswer === player }));
    }

    private sendScores(): void {
        this.calculateScores().forEach(({ player, hasAnsweredFirst }) => {
            player.send(GameEvents.UpdateScore, { score: player.score, hasAnsweredFirst });
        });
        const scores = this.room.getOnlyGamePlayers().map((player) => ({ name: player.name, score: player.score }));
        this.room.sendToOrganizer(GameEvents.SendPlayersScores, { scores });
    }

    private broadcastGameNextQuestion(): void {
        this.room.broadcast(
            GameEvents.GameQuestion,
            {},
            {
                actualQuestion: {
                    question: this.quiz.questions[this.gameQuestionIndex],
                    totalQuestion: this.quiz.questions.length,
                    actualIndex: this.gameQuestionIndex,
                } as ActualQuestion,
            },
        );
    }

    private calculateCorrectChoices() {
        const choices: ChoiceData[][] = [];
        this.quiz.questions.forEach((question, index) => {
            if (question.type !== QuestionType.QCM) return;
            const globalPlayerAnswers = this.getAmountOfPlayersWhoAnswered(index);
            const choiceData: ChoiceData[] = question.choices.flatMap((choice, i) => {
                const amount = globalPlayerAnswers[i];
                const name = choice.label;
                const isCorrect = choice.isCorrect;
                return { label: name, amount, isCorrect };
            });
            choices.push(choiceData);
        });

        return choices;
    }

    private broadcastPlayerResults(scores: Score[], choices: ChoiceData[][]): void {
        this.room.broadcast(GameEvents.PlayerSendResults, {}, {
            scores,
            choices,
            questions: this.quiz.questions,
        } as GameEventsData.PlayerSendResults);
    }

    private sortPlayersByScore(players: Player[]): Player[] {
        return players.sort((playerA, playerB) => {
            if (playerB.score !== playerA.score) {
                return playerB.score - playerA.score;
            }
            return playerA.name.localeCompare(playerB.name);
        });
    }

    private simpleDelay(delay: number, callback: () => void) {
        this.timer = new Timer(delay, {
            whenDone: callback,
            whenIncrement: (timeLeft) => {
                this.room.broadcast(GameEvents.GameCooldown, {}, { cooldown: timeLeft });
            },
        });
        this.timer.start();
    }

    private isCorrectAnswer(answer: number[], correctAnswers: number[]): boolean {
        return answer.every((index) => correctAnswers.includes(index));
    }

    private getAmountOfPlayersWhoAnswered(index: number): number[] {
        return this.room.getOnlyGamePlayers().reduce(
            (acc, player) => {
                const answer = player.getAnswer(index);
                if (!answer) return acc;
                const answers = answer.answer as number[];
                answers.forEach((i) => {
                    acc[i]++;
                });
                return acc;
            },
            [0, 0, 0, 0],
        );
    }
}
