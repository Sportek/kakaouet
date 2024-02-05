import { Component } from '@angular/core';
import { Choice } from '@common/types';

@Component({
    selector: 'app-question-overlay',
    templateUrl: './question-overlay.component.html',
    styleUrls: ['./question-overlay.component.scss'],
})
export class QuestionOverlayComponent {
    hasQuestionId: boolean = false;
    questionType: string;
    title: string;
    points: number;
    description: string;
    choices: Choice[] = [
        {
            _id: 1,
            label: 'Ma réponse',
            isCorrect: true,
        },
        {
            _id: 1,
            label: 'Ma réponse 2',
            isCorrect: false,
        },
        {
            _id: 1,
            label: 'Ma réponse 3',
            isCorrect: false,
        },
        {
            _id: 1,
            label: 'Ma réponse 4',
            isCorrect: false,
        },
    ];
    overlayStatus = {
        display: 'off',
    };

    addOverlay(): void {
        this.overlayStatus.display = 'flex';
    }

    removeOverlay(): void {
        this.overlayStatus.display = 'none';
    }
}
