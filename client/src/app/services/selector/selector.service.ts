import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SelectorService {
    private currentChoiceSubject: Subject<string> = new Subject<string>();
    private currentChoiceObservable: Observable<string> = this.currentChoiceSubject.asObservable();

    selectChoice(choice: string, choices: string[]): void {
        if (this.validateChoice(choice, choices)) {
            this.currentChoiceSubject.next(choice);
        }
    }

    getCurrentChoice(): Observable<string> {
        return this.currentChoiceObservable;
    }

    validateChoice(selectedChoice: string, choices: string[]): boolean {
        return choices.includes(selectedChoice);
    }
}
