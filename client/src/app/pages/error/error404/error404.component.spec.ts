import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BackgroundComponent } from '@app/components/background/background.component';
import { GlobalLayoutComponent } from '@app/components/global-layout/global-layout.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { Error404Component } from './error404.component';

describe('Error404Component', () => {
    let component: Error404Component;
    let fixture: ComponentFixture<Error404Component>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [Error404Component, BackgroundComponent, GlobalLayoutComponent, HeaderComponent],
            imports: [HttpClientTestingModule],
        });
        fixture = TestBed.createComponent(Error404Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
