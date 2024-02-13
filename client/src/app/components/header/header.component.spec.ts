import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { UserService } from '@app/services/user/user.service';
import { of } from 'rxjs';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let userServiceMock: { isLogin: jasmine.Spy; logout: jasmine.Spy };
    let routerMock: unknown;

    beforeEach(() => {
        userServiceMock = jasmine.createSpyObj('UserService', ['isLogin', 'logout']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            declarations: [HeaderComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: UserService, useValue: userServiceMock },
                { provide: Router, useValue: routerMock },
            ],
        });
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set isLoggedIn$ on ngOnInit', () => {
        const loginStatus = true;
        userServiceMock.isLogin.and.returnValue(of(loginStatus));
        component.ngOnInit();
        component.isLoggedIn$.subscribe((isLoggedIn) => {
            expect(isLoggedIn).toEqual(loginStatus);
        });
    });

    it('should call logout method of UserService on logout', () => {
        component.logout();
        expect(userServiceMock.logout).toHaveBeenCalledWith(routerMock);
    });

    it('should return login status from userService on isLogin', () => {
        const loginStatus = false;
        userServiceMock.isLogin.and.returnValue(of(loginStatus));
        component.isLogin().subscribe((status) => {
            expect(status).toBe(loginStatus);
        });
        expect(userServiceMock.isLogin).toHaveBeenCalled();
    });
});
