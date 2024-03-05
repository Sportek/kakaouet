import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { SelectorService } from './selector.service';

describe('SelectorService', () => {
    let service: SelectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SelectorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('selectChoice', () => {
        // eslint-disable-next-line no-undef
        it('should emit choice when valid', (done: DoneFn) => {
            const validChoices = ['Option 1', 'Option 2'];
            const choiceToSelect = 'Option 1';

            service
                .getCurrentChoice()
                .pipe(take(1))
                .subscribe({
                    next: (choice) => {
                        expect(choice).toEqual(choiceToSelect);
                        done();
                    },
                });

            service.selectChoice(choiceToSelect, validChoices);
        });

        it('should not emit choice when invalid', () => {
            const validChoices = ['Option 1', 'Option 2'];
            const invalidChoice = 'Option 3';
            let emitted = false;

            service.getCurrentChoice().subscribe(() => {
                emitted = true;
            });

            service.selectChoice(invalidChoice, validChoices);

            expect(emitted).toBeFalse();
        });
    });

    describe('validateChoice', () => {
        it('should return true for a valid choice', () => {
            const choices = ['Option 1', 'Option 2'];
            const validChoice = 'Option 1';

            expect(service.validateChoice(validChoice, choices)).toBeTrue();
        });

        it('should return false for an invalid choice', () => {
            const choices = ['Option 1', 'Option 2'];
            const invalidChoice = 'Option 3';

            expect(service.validateChoice(invalidChoice, choices)).toBeFalse();
        });
    });
});
