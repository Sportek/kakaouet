import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Games, games } from 'src/tempory-games';

@Component({
    selector: 'app-testing-game',
    templateUrl: './testing-game.component.html',
    styleUrls: ['./testing-game.component.scss'],
})
export class TestingGameComponent implements OnInit {
    game: Games | undefined;

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
        const routeParams = this.route.snapshot.paramMap;
        const gameIdFromRoute = Number(routeParams.get('gameId'));
        this.game = games.find((game) => game.id === gameIdFromRoute);
    }
}
