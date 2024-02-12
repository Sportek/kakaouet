import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JoinComponent } from './join.component';

describe('JoinComponent', () => {
    let component: JoinComponent;
    let fixture: ComponentFixture<JoinComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [JoinComponent],
            imports: [RouterTestingModule],
        });
        fixture = TestBed.createComponent(JoinComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to the game page with the code', () => {
        const router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        component.code = '123ABC';
        component.joinGame();

        expect(router.navigate).toHaveBeenCalledWith(['/game', '123ABC']);
    });
});
