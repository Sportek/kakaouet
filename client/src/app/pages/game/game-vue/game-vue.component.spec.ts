import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { GameVueComponent } from './game-vue.component';

describe('GameVueComponent', () => {
    let component: GameVueComponent;
    let fixture: ComponentFixture<GameVueComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameVueComponent],
            imports: [HttpClientTestingModule],
            providers: [MatSnackBar, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map().set('id', 'test') } } }],
        });
        fixture = TestBed.createComponent(GameVueComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
