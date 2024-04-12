import { Player } from '@app/classes/player/player';
import { Room } from '@app/classes/room/room';
import { Timer } from '@app/classes/timer';
import { HistoryService } from '@app/services/history/history.service';
import { FIRST_PLAYER_SCORE_MULTIPLICATOR } from '@common/constants';
import { ActualQuestion, ChoiceData, GameEvents, GameEventsData, Score } from '@common/game-types';
import { GameState, GameType, Question, QuestionType, Quiz } from '@common/types';

const START_GAME_DELAY = 5;
const NEXT_QUESTION_DELAY = 3;
const QRL_DELAY = 60;

export class GameSession {
    code: string;
    quiz: Quiz;
    room: Room;
    timer: Timer;
    gameState: GameState;
    type: GameType;
    gameQuestionIndex: number;
    isLocked: boolean;
    private isAlreadyChangingQuestion: boolean;
    private startTime: Date;
    private historyService: HistoryService;
    private ratingAmounts: Map<string, number[]>;

    // eslint-disable-next-line max-params -- Ici, on a besoin de tous ces paramètres
    constructor(code: string, room: Room, quiz: Quiz, gameType: GameType, historyService: HistoryService) {
        this.gameState = GameState.WaitingPlayers;
        this.gameQuestionIndex = 0;
        this.code = code;
        this.room = room;
        this.quiz = quiz;
        this.isLocked = false;
        this.room.setGame(this);
        this.type = gameType;
        this.isAlreadyChangingQuestion = false;
        this.startTime = new Date();
        this.historyService = historyService;
        this.ratingAmounts = new Map<string, number[]>();
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
        const delay = this.quiz.questions[this.gameQuestionIndex].type === QuestionType.QCM ? this.quiz.duration : QRL_DELAY;
        this.simpleDelay(delay, () => {
            if (this.quiz.questions[this.gameQuestionIndex].type === QuestionType.QRL && this.type !== GameType.Test)
                return this.changeGameState(GameState.OrganisatorCorrectingAnswers);
            this.displayQuestionResults();
        });
    }

    displayQuestionResults(): void {
        this.changeGameState(GameState.DisplayQuestionResults);
        this.sendScores();
        if (this.type === GameType.Test || this.type === GameType.Random) this.nextQuestion();
    }

    nextQuestion(): void {
        if (this.gameState !== GameState.DisplayQuestionResults) return;
        if (this.isAlreadyChangingQuestion) return;
        this.isAlreadyChangingQuestion = true;
        if (++this.gameQuestionIndex >= this.quiz.questions.length) return this.displayResults();
        this.simpleDelay(NEXT_QUESTION_DELAY, () => {
            this.changeGameState(GameState.PlayersAnswerQuestion);
            this.room.players.forEach((player) => (player.hasAnswered = false));
            this.broadcastGameNextQuestion();
            this.startQuestionCooldown();
        });
    }

    displayResults(): void {
        this.simpleDelay(NEXT_QUESTION_DELAY, () => {
            this.changeGameState(GameState.DisplayQuizResults);
            this.sendResultsToPlayers();
            this.endGame();
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

    async endGame(): Promise<void> {
        this.changeGameState(GameState.End);

        const historyData = {
            gameTitle: this.quiz.title,
            startTime: this.startTime,
            numberOfPlayers: this.room.getOnlyGamePlayers().length,
            bestScore: Math.max(...this.room.getOnlyGamePlayers().map((player) => player.score)),
        };

        await this.historyService.createNewHistory(historyData);
    }

    changeGameState(gameState: GameState): void {
        if (gameState === GameState.OrganisatorCorrectingAnswers) this.filterNullAnswers();
        this.gameState = gameState;
        this.room.broadcast(GameEvents.GameStateChanged, {}, { gameState: this.gameState });
        this.isAlreadyChangingQuestion = false;
    }

    changeGameLockState(): void {
        this.isLocked = !this.isLocked;
        this.room.broadcast(GameEvents.GameLockedStateChanged, {}, { isLocked: this.isLocked });
    }

    toggleTimer(): void {
        if (this.timer) this.timer.togglePlayPause();
    }

    speedUpTimer(): void {
        if (this.timer) {
            this.timer.speedUp();
            this.room.broadcast(GameEvents.GameSpeedUpTimer, {});
        }
    }

    broadcastMessage(content: string, player?: Player): void {
        const newDate: Date = new Date();
        const playerName = player && player.name ? player.name : '';
        this.room.broadcast(GameEvents.PlayerSendMessage, {}, { name: playerName, content, createdAt: newDate });
    }

    saveAnswerRatings(player: Player, score: number) {
        player.hasAnswered = true;
        player.confirmAnswer();
        player.score += score;
        const rating = score / (this.quiz.questions[this.gameQuestionIndex].points ?? 1);
        const questionTitle: string = this.quiz.questions[this.gameQuestionIndex].text;
        if (!this.ratingAmounts[questionTitle]) {
            this.ratingAmounts[questionTitle] = [0, 0, 0];
        }
        this.ratingAmounts[questionTitle][rating * 2]++;
    }

    private filterNullAnswers() {
        for (const player of this.room.players) {
            if (!player.getAnswer(this.gameQuestionIndex) && !player.hasGiveUp) {
                player.setAnswer(' ');
                player.confirmAnswer();
                this.room.broadcast(GameEvents.PlayerConfirmAnswers, {}, { name: player.name });
            }
        }
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
                if (question.type === QuestionType.QCM) {
                    player.score += question.points;
                } else {
                    player.score += question.points * player.currentQuestionMultiplier;
                }
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
        if (question.type !== QuestionType.QCM) return this.room.players.map((player) => ({ player, hasAnsweredFirst: false }));
        const correctAnswersIndex = question.choices.flatMap((choice, index) => (choice.isCorrect ? index : []));
        this.broadcastCorrectAnswers(question);

        const goodAnswerPlayers = this.filterCorrectAnswerPlayers(this.room.getOnlyGamePlayers(), correctAnswersIndex, question);
        const firstPlayerToAnswer = goodAnswerPlayers[0] || null;
        if (!this.hasMultiplePlayersAnsweredCorrectly(goodAnswerPlayers) && firstPlayerToAnswer) {
            firstPlayerToAnswer.score += question.points * FIRST_PLAYER_SCORE_MULTIPLICATOR;
            firstPlayerToAnswer.bonus++;
        }

        return goodAnswerPlayers.map((player) => ({ player, hasAnsweredFirst: firstPlayerToAnswer === player }));
    }

    private sendScores(): void {
        this.calculateScores().forEach(({ player, hasAnsweredFirst }) => {
            if (this.quiz.questions[this.gameQuestionIndex].type === QuestionType.QRL && this.type === GameType.Test) {
                return player.send(GameEvents.UpdateScore, { score: this.quiz.questions[this.gameQuestionIndex].points, hasAnsweredFirst: false });
            }
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
            if (question.type === QuestionType.QRL) {
                return choices.push(this.qrlRatings(question));
            }
            choices.push(this.qcmCorrectChoices(question, index));
        });

        return choices;
    }

    private qrlRatings(question: Question): ChoiceData[] | null {
        if (this.type === GameType.Test || question.type !== QuestionType.QRL) return;
        return [
            { text: '0%', amount: this.ratingAmounts[question.text][0], isCorrect: true },
            { text: '50%', amount: this.ratingAmounts[question.text][1], isCorrect: true },
            { text: '100%', amount: this.ratingAmounts[question.text][2], isCorrect: true },
        ];
    }

    private qcmCorrectChoices(question: Question, index: number) {
        if (question.type !== QuestionType.QCM) return;
        const choiceData: ChoiceData[] = question.choices.flatMap((choice, i) => {
            const amount = this.getAmountOfPlayersWhoAnswered(index)[i];
            const name = choice.text;
            const isCorrect = choice.isCorrect;
            return { text: name, amount, isCorrect };
        });
        return choiceData;
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
