import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CreateUpdateQuizComponent } from './create-update-quiz.component';

describe('CreateUpdateQuizComponent', () => {
    let component: CreateUpdateQuizComponent;
    let fixture: ComponentFixture<CreateUpdateQuizComponent>;
    let mockActivatedRoute;

    beforeEach(() => {
        const paramMap = {
            get: (key: string) => (key === 'id' ? 'some-id' : null),
            keys: [],
        };

        mockActivatedRoute = {
            paramMap: of(paramMap),
        };

        TestBed.configureTestingModule({
            declarations: [CreateUpdateQuizComponent],
            providers: [{ provide: ActivatedRoute, useValue: mockActivatedRoute }],
        });
        fixture = TestBed.createComponent(CreateUpdateQuizComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
