import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameService } from '@app/services/game/game.service';
import { of } from 'rxjs';
import { OrganisatorComponent } from './organisator.component';

class MockGameService {
    question = of(null);
    cooldown = of(0);
    players = of([]);
    filterPlayers = jasmine.createSpy('filterPlayers').and.returnValue([]);
    toggleTimer = jasmine.createSpy('toggleTimer');
    speedUpTimer = jasmine.createSpy('speedUpTimer');
    nextQuestion = jasmine.createSpy('nextQuestion');
}

describe('OrganisatorComponent', () => {
    let component: OrganisatorComponent;
    let fixture: ComponentFixture<OrganisatorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrganisatorComponent],
            providers: [
                {
                    provide: GameService,
                    useClass: MockGameService,
                },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(OrganisatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
