import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionOverlayComponent } from './question-overlay.component';

describe('QuestionOverlayComponent', () => {
    let component: QuestionOverlayComponent;
    let fixture: ComponentFixture<QuestionOverlayComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionOverlayComponent],
        });
        fixture = TestBed.createComponent(QuestionOverlayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
