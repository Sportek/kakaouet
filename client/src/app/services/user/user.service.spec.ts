/* eslint-disable max-classes-per-file */
import { HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BASE_URL } from '@app/constants';
import { AdminLoginState, UserService } from './user.service';

describe('UserService', () => {
    let service: UserService;
    let httpTestingController: HttpTestingController;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    { path: 'admin/some-route', component: class {} },
                    { path: 'admin/login', component: class {} },
                ]),
            ],
            providers: [UserService],
        });

        service = TestBed.inject(UserService);
        httpTestingController = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);

        const reqInit = httpTestingController.expectOne(`${BASE_URL}/user/auth/login`);
        reqInit.flush(null, { status: HttpStatusCode.Ok, statusText: 'OK', headers: { isLogin: 'false' } });
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set loggedState to LoggedIn on successful login check', () => {
        service.checkLoginStatus();
        const req = httpTestingController.expectOne(`${BASE_URL}/user/auth/login`);
        req.flush({ isLogin: true }, { status: HttpStatusCode.Ok, statusText: 'OK' });

        service.loggedState.subscribe((state) => {
            expect(state).toEqual(AdminLoginState.LoggedIn);
        });
    });

    it('should set loggedState to Failed on unsuccessful login check', () => {
        service.checkLoginStatus();
        const req = httpTestingController.expectOne(`${BASE_URL}/user/auth/login`);
        req.flush({ isLogin: false }, { status: HttpStatusCode.Ok, statusText: 'OK' });

        service.loggedState.subscribe((state) => {
            expect(state).toEqual(AdminLoginState.Failed);
        });
    });

    it('should perform login and set loggedState to LoggedIn on success', fakeAsync(() => {
        const password = 'testPassword';
        service.login(router, password);
        const reqLogin = httpTestingController.expectOne(`${BASE_URL}/user/auth/login`);
        reqLogin.flush({ success: true }, { status: HttpStatusCode.Ok, statusText: 'OK' });

        tick();

        service.loggedState.subscribe((state) => {
            expect(state).toEqual(AdminLoginState.LoggedIn);
        });
    }));

    it('should perform logout and set loggedState to NotLoggedIn on success', fakeAsync(() => {
        spyOn(router, 'navigateByUrl');
        service.logout(router);
        const reqLogout = httpTestingController.expectOne(`${BASE_URL}/user/auth/logout`);
        reqLogout.flush({ success: true }, { status: HttpStatusCode.Ok, statusText: 'OK' });

        tick();

        expect(router.navigateByUrl).toHaveBeenCalledWith('/', { replaceUrl: true });
        service.loggedState.subscribe((state) => {
            expect(state).toEqual(AdminLoginState.NotLoggedIn);
        });
    }));

    it('isLogin should return false if user is not logged in', fakeAsync(() => {
        service.isLogin().subscribe((isLoggedIn) => {
            expect(isLoggedIn).toBeFalse();
        });

        const req = httpTestingController.expectOne(`${BASE_URL}/user/auth/login`);
        req.flush(null, { status: HttpStatusCode.Ok, statusText: 'OK', headers: { isLogin: 'false' } });

        tick();
    }));

    it('should redirect to /admin/login when not logged in and accessing admin route', fakeAsync(() => {
        spyOn(router, 'navigateByUrl').and.callThrough();
        router.navigate(['/admin/some-route']);
        tick();
        service.loggedState.next(AdminLoginState.Failed);
        tick();
        expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/login', { replaceUrl: true });
    }));

    it('should handle error in isLogin and return false', fakeAsync(() => {
        service.isLogin().subscribe((isLoggedIn) => {
            expect(isLoggedIn).toBeFalse();
        });

        const req = httpTestingController.expectOne(`${BASE_URL}/user/auth/login`);
        req.error(new ProgressEvent('Error'));
        flush();
    }));
});
