import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-selector',
    templateUrl: './selector.component.html',
    styleUrls: ['./selector.component.scss'],
})
export class SelectorComponent implements OnInit {
    @Input() label: string = '';
    @Input() choices: string[] = [];
    @Output() emitCurrentChoice = new EventEmitter<string>();
    currentChoice: string | undefined = '';
    dropdownOpen: boolean = false;

    ngOnInit(): void {
        this.currentChoice = this.choices[0];
    }

    selectChoice(choice: string): void {
        if (this.validateChoice(choice)) {
            this.currentChoice = choice;
            this.emitCurrentChoice.emit(this.currentChoice);
        }
        this.modifyDropdown();
    }

    validateChoice(selectedChoice: string): boolean {
        for (const choice in this.choices) {
            if (selectedChoice === this.choices[choice]) {
                return true;
            }
        }
        return false;
    }

    modifyDropdown(): void {
        this.dropdownOpen = !this.dropdownOpen;
    }
}
