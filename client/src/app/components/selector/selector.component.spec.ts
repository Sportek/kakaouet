import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatMenuModule } from '@angular/material/menu';
import { SelectorComponent } from './selector.component';

describe('SelectorComponent', () => {
    let component: SelectorComponent;
    let fixture: ComponentFixture<SelectorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SelectorComponent],
            imports: [MatMenuModule],
        });
        fixture = TestBed.createComponent(SelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
