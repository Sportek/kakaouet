import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { BackgroundComponent } from '@app/components/background/background.component';
import { GlobalLayoutComponent } from '@app/components/global-layout/global-layout.component';
import { AdminLoginState, UserService } from '@app/services/user/user.service';
import { of } from 'rxjs';
import { AdminLoginPageComponent } from './admin-login-page.component';

describe('AdminLoginPageComponent', () => {
    let component: AdminLoginPageComponent;
    let fixture: ComponentFixture<AdminLoginPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminLoginPageComponent, BackgroundComponent, GlobalLayoutComponent],
            imports: [HttpClientTestingModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: Router,
                    useValue: {
                        navigateByUrl: jasmine.createSpy('navigateByUrl'),
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        login: jasmine.createSpy('login'),
                        loggedState: of(AdminLoginState.LoggedIn),
                    },
                },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminLoginPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should redirect to /admin when logged in on init', () => {
        const router = TestBed.inject(Router);
        expect(router.navigateByUrl).toHaveBeenCalledWith('/admin', { replaceUrl: true });
    });

    it('should call UserService.login with the password on submit', () => {
        const userService = TestBed.inject(UserService);
        const router = TestBed.inject(Router);
        component.password = 'testPassword';
        component.submitPassword();
        expect(userService.login).toHaveBeenCalledWith(router, 'testPassword');
    });

    it('should call submitPassword when Enter key is pressed', () => {
        spyOn(component, 'submitPassword');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.onKeyEnter(event);
        expect(component.submitPassword).toHaveBeenCalled();
    });
});
