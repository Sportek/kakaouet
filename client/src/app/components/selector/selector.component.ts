import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SelectorService } from '@app/services/selector/selector.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-selector',
    templateUrl: './selector.component.html',
    styleUrls: ['./selector.component.scss'],
})
export class SelectorComponent implements OnInit, OnDestroy {
    @Input() label: string = '';
    @Input() choices: string[] = [];
    currentChoice: string;
    dropdownOpen: boolean = false;

    private emitChoiceSubscription: Subscription;

    constructor(private selectorService: SelectorService) {}

    ngOnInit(): void {
        this.currentChoice = this.choices[0];
        this.emitChoiceSubscription = this.selectorService.getCurrentChoice().subscribe({
            next: (choice) => {
                if (this.choices.includes(choice)) this.currentChoice = choice;
            },
        });
    }

    selectChoice(choice: string): void {
        this.selectorService.selectChoice(choice, this.choices);
        this.modifyDropdown();
    }

    modifyDropdown(): void {
        this.dropdownOpen = !this.dropdownOpen;
    }

    ngOnDestroy(): void {
        if (this.emitChoiceSubscription) {
            this.emitChoiceSubscription.unsubscribe();
        }
    }
}
