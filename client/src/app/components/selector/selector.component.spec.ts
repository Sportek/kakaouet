import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { SelectorComponent } from './selector.component';

describe('SelectorComponent', () => {
    let component: SelectorComponent;
    let fixture: ComponentFixture<SelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectorComponent],
            imports: [MatMenuModule],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectorComponent);
        component = fixture.componentInstance;
        component.label = 'Test Label';
        component.choices = ['Option 1', 'Option 2', 'Option 3'];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have the first choice selected by default on init', () => {
        expect(component.currentChoice).toBe(component.choices[0]);
    });

    it('should emit the selected choice when selectChoice is called with a valid choice', () => {
        spyOn(component.emitCurrentChoice, 'emit');
        const choiceToSelect = 'Option 2';
        component.selectChoice(choiceToSelect);
        expect(component.currentChoice).toBe(choiceToSelect);
        expect(component.emitCurrentChoice.emit).toHaveBeenCalledWith(choiceToSelect);
    });

    it('should not emit when selectChoice is called with an invalid choice', () => {
        spyOn(component.emitCurrentChoice, 'emit');
        const invalidChoice = 'Invalid Option';
        component.selectChoice(invalidChoice);
        expect(component.emitCurrentChoice.emit).not.toHaveBeenCalled();
    });

    it('should toggle dropdownOpen when modifyDropdown is called', () => {
        const initialDropdownState = component.dropdownOpen;
        component.modifyDropdown();
        expect(component.dropdownOpen).toBe(!initialDropdownState);
    });

    it('should validate the choice correctly', () => {
        const validChoice = 'Option 1';
        const invalidChoice = 'Invalid Option';
        expect(component.validateChoice(validChoice)).toBeTrue();
        expect(component.validateChoice(invalidChoice)).toBeFalse();
    });
});
