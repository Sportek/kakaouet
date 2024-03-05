import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SelectorService } from '@app/services/selector/selector.service';
import { of } from 'rxjs';
import { SelectorComponent } from './selector.component';

class MockSelectorService {
    getCurrentChoice = jasmine.createSpy().and.returnValue(of('Choice 1'));
    selectChoice = jasmine.createSpy();
}

describe('SelectorComponent', () => {
    let component: SelectorComponent;
    let fixture: ComponentFixture<SelectorComponent>;
    let mockSelectorService: MockSelectorService;

    beforeEach(async () => {
        mockSelectorService = new MockSelectorService();

        await TestBed.configureTestingModule({
            declarations: [SelectorComponent],
            providers: [{ provide: SelectorService, useValue: mockSelectorService }],
            imports: [MatMenuModule, NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectorComponent);
        component = fixture.componentInstance;

        component.choices = ['Choice 1', 'Choice 2', 'Choice 3'];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set the first choice as currentChoice on init', () => {
        expect(component.currentChoice).toEqual('Choice 1');
    });

    it('should call selectChoice on the service when selectChoice is called', () => {
        const choice = 'Choice 2';
        component.selectChoice(choice);
        expect(mockSelectorService.selectChoice).toHaveBeenCalledWith(choice, component.choices);

        expect(component.dropdownOpen).toBeTrue();
    });

    it('should toggle dropdown state when modifyDropdown is called', () => {
        expect(component.dropdownOpen).toBeFalse();
        component.modifyDropdown();
        expect(component.dropdownOpen).toBeTrue();
        component.modifyDropdown();
        expect(component.dropdownOpen).toBeFalse();
    });
});
