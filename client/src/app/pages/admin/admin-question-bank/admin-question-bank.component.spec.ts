import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AdminQuestionBankComponent } from './admin-question-bank.component';

describe('AdminQuestionBankComponent', () => {
    let component: AdminQuestionBankComponent;
    let fixture: ComponentFixture<AdminQuestionBankComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminQuestionBankComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminQuestionBankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set visibility to all options when label is "Toutes"', () => {
        component.changeVisibility('Toutes');
        expect(component.visibility).toEqual(['QCM', 'QRL']);
    });

    it('should set visibility to "QCM" when label is "Choix Multiples"', () => {
        component.changeVisibility('Choix Multiples');
        expect(component.visibility).toEqual(['QCM']);
    });

    it('should set visibility to "QRL" when label is "Réponse Libre"', () => {
        component.changeVisibility('Réponse Libre');
        expect(component.visibility).toEqual(['QRL']);
    });
});
