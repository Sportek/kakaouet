import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-selector',
    templateUrl: './selector.component.html',
    styleUrls: ['./selector.component.scss'],
})
export class SelectorComponent implements OnInit {
    @Input() label: string = '';
    @Input() choices: string[] = [];
    currentChoice: string | undefined = '';

    ngOnInit(): void {
        this.currentChoice = this.choices[0];
    }

    selectChoice(choice: string): void {
        this.currentChoice = choice;
    }
}
