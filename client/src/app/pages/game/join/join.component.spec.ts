import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GlobalLayoutComponent } from '@app/components/global-layout/global-layout.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { JoinComponent } from './join.component';

describe('JoinComponent', () => {
    let component: JoinComponent;
    let fixture: ComponentFixture<JoinComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [JoinComponent, GlobalLayoutComponent, HeaderComponent],
            imports: [
                RouterTestingModule,
                FormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                BrowserAnimationsModule,
                HttpClientTestingModule,
            ],
        });
        fixture = TestBed.createComponent(JoinComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to the game page with the code', () => {
        const router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        component.code = '123ABC';
        component.joinGame();

        expect(router.navigate).toHaveBeenCalledWith(['/game', '123ABC']);
    });
});
