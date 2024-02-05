import { HttpClient, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_URL } from '@app/constants';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';

export enum AdminLoginState {
    LoggedIn = 'LoggedIn',
    Failed = 'Failed',
    NotLoggedIn = 'NotLoggedIn',
}
@Injectable({
    providedIn: 'root',
})
export class UserService {
    loggedState = new BehaviorSubject<AdminLoginState>(AdminLoginState.NotLoggedIn);
    constructor(
        private http: HttpClient,
        private router: Router,
    ) {
        this.checkLoginStatus();
        this.loggedState.subscribe((state) => {
            if (state === AdminLoginState.LoggedIn && this.router.url === '/admin/login') this.router.navigateByUrl('/admin', { replaceUrl: true });
            if (state !== AdminLoginState.LoggedIn && this.router.url.includes('/admin/'))
                this.router.navigateByUrl('/admin/login', { replaceUrl: true });
        });
    }

    checkLoginStatus(): void {
        this.http
            .get<null>(`${BASE_URL}/user/auth/login`, { observe: 'response', withCredentials: true })
            .pipe(
                tap((response: HttpResponse<null>) => {
                    const isLogin = response.body ? response.body['isLogin'] : false;
                    this.loggedState.next(isLogin ? AdminLoginState.LoggedIn : AdminLoginState.Failed);
                }),
            )
            .subscribe();
    }

    login(router: Router, password: string) {
        this.http
            .post<null>(`${BASE_URL}/user/auth/login`, { password }, { observe: 'response', withCredentials: true })
            .pipe(
                tap((response: HttpResponse<null>) => {
                    const isLogin = response.body ? response.body['success'] : false;
                    this.loggedState.next(isLogin ? AdminLoginState.LoggedIn : AdminLoginState.Failed);
                }),
            )
            .subscribe();
    }

    logout(router: Router) {
        this.http
            .get<null>(`${BASE_URL}/user/auth/logout`, { observe: 'response', withCredentials: true })
            .pipe(
                tap((response: HttpResponse<null>) => {
                    const hasSuccess = response.body ? response.body['success'] : false;
                    if (hasSuccess) {
                        router.navigateByUrl('/', { replaceUrl: true });
                        this.loggedState.next(AdminLoginState.NotLoggedIn);
                    }
                }),
            )
            .subscribe();
    }

    isLogin(): Observable<boolean> {
        return this.http
            .get<null>(`${BASE_URL}/user/auth/login`, {
                observe: 'response',
                withCredentials: true,
            })
            .pipe(
                map((response: HttpResponse<null>) => (response.status === HttpStatusCode.Ok && response.body?.['isLogin']) ?? false),
                catchError(() => of(false)),
            );
    }

    checkAndRedirect(redirectUrl: string): void {
        this.loggedState.asObservable().subscribe((isLogin) => {
            if (isLogin !== AdminLoginState.LoggedIn) {
                this.router.navigateByUrl(redirectUrl, { replaceUrl: true });
            }
        });
    }
}
