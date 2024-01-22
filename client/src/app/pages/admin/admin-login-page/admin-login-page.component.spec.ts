import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLoginPageComponent } from './admin-login-page.component';

describe('AdminLoginPageComponent', () => {
    let component: AdminLoginPageComponent;
    let fixture: ComponentFixture<AdminLoginPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminLoginPageComponent],
        });
        fixture = TestBed.createComponent(AdminLoginPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
