import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BankQuestionComponent } from './bank-question.component';

describe('BankQuestionComponent', () => {
    let component: BankQuestionComponent;
    let fixture: ComponentFixture<BankQuestionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BankQuestionComponent],
            imports: [HttpClientTestingModule],
        });
        fixture = TestBed.createComponent(BankQuestionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
