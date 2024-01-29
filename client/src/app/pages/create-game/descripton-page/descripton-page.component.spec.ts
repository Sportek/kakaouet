import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { DescriptonPageComponent } from './descripton-page.component';

describe('DescriptonPageComponent', () => {
    let component: DescriptonPageComponent;
    let fixture: ComponentFixture<DescriptonPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DescriptonPageComponent],
            imports: [HttpClientModule, HttpClientTestingModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: new Map().set('gameId', 1) },
                    },
                },
            ],
        });
        fixture = TestBed.createComponent(DescriptonPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
