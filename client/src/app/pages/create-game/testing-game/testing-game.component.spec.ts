import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { TestingGameComponent } from './testing-game.component';

describe('TestingGameComponent', () => {
    let component: TestingGameComponent;
    let fixture: ComponentFixture<TestingGameComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestingGameComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: new Map().set('gameId', 1) },
                    },
                },
            ],
        });
        fixture = TestBed.createComponent(TestingGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
