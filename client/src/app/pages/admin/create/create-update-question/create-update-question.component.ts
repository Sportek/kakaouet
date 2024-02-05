import { Component } from '@angular/core';
import { Choice } from '@common/types';

@Component({
    selector: 'app-create-update-question',
    templateUrl: './create-update-question.component.html',
    styleUrls: ['./create-update-question.component.scss'],
})
export class CreateUpdateQuestionComponent {
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
            _id: 2,
            label: 'Ma réponse 2',
            isCorrect: false,
        },
        {
            _id: 3,
            label: 'Ma réponse 3',
            isCorrect: false,
        },
        {
            _id: 4,
            label: 'Ma réponse 4',
            isCorrect: false,
        },
    ];
}
