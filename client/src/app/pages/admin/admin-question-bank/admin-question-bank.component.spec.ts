import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectorService } from '@app/services/selector/selector.service';
import { of } from 'rxjs';
import { AdminQuestionBankComponent } from './admin-question-bank.component';

class MockSelectorService {
    getCurrentChoice = jasmine.createSpy().and.returnValue(of('Toutes'));
}

describe('AdminQuestionBankComponent', () => {
    let component: AdminQuestionBankComponent;
    let fixture: ComponentFixture<AdminQuestionBankComponent>;
    let mockSelectorService: MockSelectorService;

    beforeEach(async () => {
        mockSelectorService = new MockSelectorService();

        await TestBed.configureTestingModule({
            declarations: [AdminQuestionBankComponent],
            providers: [{ provide: SelectorService, useValue: mockSelectorService }],
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

    it('should react to choice emission from SelectorService with "Toutes"', () => {
        mockSelectorService.getCurrentChoice.and.returnValue(of('Toutes'));
        fixture.detectChanges();

        expect(component.visibility).toEqual(['QCM', 'QRL']);
    });

    it('should react to choice emission from SelectorService with "Choix Multiples"', () => {
        mockSelectorService.getCurrentChoice.and.returnValue(of('Choix Multiples'));
        component.ngOnInit();
        fixture.detectChanges();

        expect(component.visibility).toEqual(['QCM']);
    });

    it('should react to choice emission from SelectorService with "Réponse Libre"', () => {
        mockSelectorService.getCurrentChoice.and.returnValue(of('Réponse Libre'));
        component.ngOnInit();
        fixture.detectChanges();

        expect(component.visibility).toEqual(['QRL']);
    });

    it('should unsubscribe from currentChoice on destroy', () => {
        expect(() => component.ngOnDestroy()).not.toThrow();
    });
});
