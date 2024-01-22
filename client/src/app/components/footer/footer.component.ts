import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
    members: { backend: string[]; frontend: string[] } = {
        backend: ['Gabriel Landry', 'Yacine Lawali', 'Eli Boulanger'],
        frontend: ['Mohammad Jamil Miah', 'Dimitri Manguin', 'Thomas Petrie'],
    };

    ngOnInit(): void {
        this.members.backend = shuffleArray(this.members.backend);
        this.members.frontend = shuffleArray(this.members.frontend);
    }
}
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
const shuffleArray = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
