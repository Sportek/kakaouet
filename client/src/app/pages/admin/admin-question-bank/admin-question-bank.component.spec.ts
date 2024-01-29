import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQuestionBankComponent } from './admin-question-bank.component';

describe('AdminQuestionBankComponent', () => {
    let component: AdminQuestionBankComponent;
    let fixture: ComponentFixture<AdminQuestionBankComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminQuestionBankComponent],
        });
        fixture = TestBed.createComponent(AdminQuestionBankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
