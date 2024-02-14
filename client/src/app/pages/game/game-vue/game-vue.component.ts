import { Component, HostListener, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { BaseQuestion, Choice, GameState, QuestionType } from '@common/types';
import { Observable, filter, map, of, switchMap } from 'rxjs';

@Component({
    selector: 'app-game-vue',
    templateUrl: './game-vue.component.html',
    styleUrls: ['./game-vue.component.scss'],
})
export class GameVueComponent implements OnInit {
    constructor(
        public gameService: GameService,
        private snackbar: MatSnackBar,
        private router: ActivatedRoute,
    ) {}

    @HostListener('document:keydown', ['$event'])
    keyboardChoices(event: KeyboardEvent) {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' && target.getAttribute('type') === 'text') {
            return;
        }

        this.isQCMQuestion().subscribe((isQCM) => {
            if (isQCM && this.gameService.canChangeChoices) {
                this.getQCMChoices().subscribe((choices) => {
                    const possibleChoices = choices.map((choice, index) => (index + 1).toString());
                    if (possibleChoices.includes(event.key)) {
                        this.gameService.selectChoice(parseInt(event.key, 10) - 1);
                    }
                });
            }
        });

        if (event.key === 'Enter' && this.gameService.canChangeChoices) {
            this.setResponseAsFinal();
        }
    }

    async ngOnInit() {
        await this.gameService.init(this.router.snapshot.paramMap.get('id'));
    }

    setResponseAsFinal() {
        if (this.gameService.selectedChoices.length === 0) {
            this.snackbar.open('Veuillez sélectionner au moins une réponse', '❌', { duration: 2000 });
            return;
        }
        this.gameService.canChangeChoices = false;
    }

    isQCMQuestion(): Observable<boolean> {
        return this.gameService.actualQuestion.pipe(map((question) => question.type === QuestionType.QCM.toUpperCase()));
    }

    getQCMChoices(): Observable<Choice[]> {
        return this.gameService.actualQuestion.pipe(
            filter((question) => question.type === QuestionType.QCM),
            map((question) => {
                const qcmQuestion = question as { type: QuestionType.QCM; choices: Choice[] } & BaseQuestion;
                return qcmQuestion.choices;
            }),
            switchMap((choices) => {
                return choices ? of(choices) : of([]);
            }),
        );
    }

    getQuestionLabel(): Observable<string> {
        return this.gameService.actualQuestion.pipe(map((question) => question.label));
    }

    getQuestionPoints(): Observable<number> {
        return this.gameService.actualQuestion.pipe(map((question) => question.points));
    }

    isIncorrectAnswer(index: number): Observable<boolean> {
        if (this.gameService.gameState !== GameState.DisplayQuestionResults) {
            return of(false);
        }
        return this.gameService.getCorrectAnswers().pipe(
            map((answers) => {
                return !answers.includes(index);
            }),
        );
    }
}
