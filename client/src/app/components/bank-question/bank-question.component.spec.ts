import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BankQuestionComponent } from './bank-question.component';

describe('BankQuestionComponent', () => {
    let component: BankQuestionComponent;
    let fixture: ComponentFixture<BankQuestionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BankQuestionComponent],
            imports: [HttpClientTestingModule, MatDialogModule],
            providers: [{ provide: MatDialog, useValue: {} }],
        });
        fixture = TestBed.createComponent(BankQuestionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
