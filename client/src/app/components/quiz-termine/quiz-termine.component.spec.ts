import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizTermineComponent } from './quiz-termine.component';

describe('QuizTermineComponent', () => {
    let component: QuizTermineComponent;
    let fixture: ComponentFixture<QuizTermineComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuizTermineComponent],
        });
        fixture = TestBed.createComponent(QuizTermineComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
