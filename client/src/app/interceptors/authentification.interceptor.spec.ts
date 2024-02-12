import { TestBed } from '@angular/core/testing';

import { HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthentificationInterceptor } from './authentification.interceptor';

describe('AuthentificationInterceptor', () => {
    let interceptor: AuthentificationInterceptor;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AuthentificationInterceptor],
        });
        interceptor = TestBed.inject(AuthentificationInterceptor);
    });

    it('should be created', () => {
        expect(interceptor).toBeTruthy();
    });

    it('should add withCredentials to the request', (done) => {
        const testRequest = new HttpRequest('GET', '/test');
        const next: HttpHandler = {
            handle: (request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
                expect(request.withCredentials).toBeTrue();
                return of(new HttpResponse({ status: 200 }));
            },
        };
        interceptor.intercept(testRequest, next).subscribe({
            complete: () => done(),
        });
    });
});
