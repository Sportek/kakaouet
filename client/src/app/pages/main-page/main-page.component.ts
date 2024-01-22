import { Component } from '@angular/core';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly teamNumber: number = 109;
    readonly teamMembers: string[] = ['Elie Boulanger', 'Gabriel Landry', 'Yacine Lawali', 'Dimitri Maguin', 'Mohammad Jamil Miah', 'Thomas Petrie'];
}
