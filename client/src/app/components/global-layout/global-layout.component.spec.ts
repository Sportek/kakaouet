import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HeaderComponent } from '@app/components/header/header.component';
import { GlobalLayoutComponent } from './global-layout.component';

describe('GlobalLayoutComponent', () => {
    let component: GlobalLayoutComponent;
    let fixture: ComponentFixture<GlobalLayoutComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GlobalLayoutComponent, HeaderComponent],
            imports: [HttpClientTestingModule],
        });
        fixture = TestBed.createComponent(GlobalLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
