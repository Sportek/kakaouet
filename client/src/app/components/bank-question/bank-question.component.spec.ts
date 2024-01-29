import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankQuestionComponent } from './bank-question.component';

describe('BankQuestionComponent', () => {
    let component: BankQuestionComponent;
    let fixture: ComponentFixture<BankQuestionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BankQuestionComponent],
        });
        fixture = TestBed.createComponent(BankQuestionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
