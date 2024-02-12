import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizQuestionOverlayComponent } from './quiz-question-overlay.component';

describe('QuizQuestionOverlayComponent', () => {
    let component: QuizQuestionOverlayComponent;
    let fixture: ComponentFixture<QuizQuestionOverlayComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuizQuestionOverlayComponent],
            imports: [HttpClientModule, HttpClientTestingModule],
        });
        fixture = TestBed.createComponent(QuizQuestionOverlayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
