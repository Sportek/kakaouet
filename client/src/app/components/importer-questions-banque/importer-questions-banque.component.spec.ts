import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionService } from '@app/services/quiz/question.service';
import { QuestionBankImportComponent } from './importer-questions-banque.component';

describe('QuestionBankImportComponent', () => {
    let component: QuestionBankImportComponent;
    let fixture: ComponentFixture<QuestionBankImportComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [QuestionBankImportComponent],
            imports: [HttpClientModule, HttpClientTestingModule],
            providers: [QuestionService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionBankImportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
