/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game/game.service';
import { PlayerClient } from '@common/game-types';
import { GameRole, GameType } from '@common/types';
import { Observable, of } from 'rxjs';
import { WaitingRoomComponent } from './waiting-room.component';

class MockGameService {
    players: Observable<{ name: string; role: GameRole; score: number; isExcluded: boolean; hasGiveUp: boolean }[]> = of([]);

    client = of({ name: 'Test', role: GameRole.Organisator, score: 100 });
    cooldown = of(0);
    game = of({ code: 'TestCode', quizName: 'TestQuiz', type: GameType.Test });
    isLocked = of(false);

    startGame = jasmine.createSpy('startGame');
    changeLockState = jasmine.createSpy('changeLockState');
    banPlayer = jasmine.createSpy('banPlayer');
    filterPlayers = jasmine.createSpy('filterPlayers').and.returnValue([]);
}

describe('WaitingRoomComponent', () => {
    let component: WaitingRoomComponent;
    let fixture: ComponentFixture<WaitingRoomComponent>;
    let gameService: MockGameService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WaitingRoomComponent],
            providers: [{ provide: GameService, useClass: MockGameService }],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        gameService = TestBed.inject(GameService) as unknown as MockGameService;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start game when start method is called', () => {
        component.start();
        expect(gameService.startGame).toHaveBeenCalled();
    });

    it('should change lock state when changeLockState method is called', () => {
        component.changeLockState();
        expect(gameService.changeLockState).toHaveBeenCalled();
    });

    it('should ban player when banPlayer method is called', () => {
        const player: PlayerClient = { name: 'Test Player', role: GameRole.Player, score: 10, isExcluded: false, hasGiveUp: false };
        component.banPlayer(player);
        expect(gameService.banPlayer).toHaveBeenCalledWith(player);
    });

    it('should filter players correctly', () => {
        const filteredPlayers = component.filterPlayers();
        expect(gameService.filterPlayers).toHaveBeenCalled();
        expect(filteredPlayers).toEqual([]);
    });

    it('should handle subscription updates', () => {
        gameService.players = of([{ name: 'Player 1', role: GameRole.Player, score: 10, isExcluded: false, hasGiveUp: false }]);
        gameService.client = of({ name: 'Organizer', role: GameRole.Organisator, score: 100 });
        gameService.cooldown = of(10);
        gameService.game = of({ code: 'XYZ123', quizName: 'Sample Quiz', type: GameType.Test });
        gameService.isLocked = of(true);

        component.ngOnInit();

        expect(component.players.length).toBe(1);
        expect(component.client).toEqual(jasmine.objectContaining({ role: GameRole.Organisator }));
        expect(component.cooldown).toBe(10);
        expect(component.game).toEqual(jasmine.objectContaining({ code: 'XYZ123' }));
        expect(component.isLocked).toBeTrue();
    });

    it('should set isCooldownStarted correctly based on cooldown value', () => {
        gameService.cooldown = of(1);
        component.ngOnInit();
        fixture.detectChanges();

        expect(component.isCooldownStarted).toBeTrue();
    });

    it('should handle cooldown value transition from negative to positive correctly', () => {
        gameService.cooldown = of(-1);
        component.ngOnInit();
        expect(component.isCooldownStarted).toBeFalse();

        gameService.cooldown = of(1);
        component.ngOnInit();
        fixture.detectChanges();

        expect(component.isCooldownStarted).toBeTrue();
    });

    afterEach(() => {
        fixture.destroy();
    });
});
