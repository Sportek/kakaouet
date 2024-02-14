import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizHistoryComponent } from './quiz-history.component';

describe('QuizHistoryComponent', () => {
    let component: QuizHistoryComponent;
    let fixture: ComponentFixture<QuizHistoryComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuizHistoryComponent],
        });
        fixture = TestBed.createComponent(QuizHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
