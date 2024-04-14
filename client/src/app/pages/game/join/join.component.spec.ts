import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GlobalLayoutComponent } from '@app/components/global-layout/global-layout.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { JoinService } from '@app/services/join/join.service';
import { JoinComponent } from './join.component';

describe('JoinComponent', () => {
    let component: JoinComponent;
    let fixture: ComponentFixture<JoinComponent>;
    let joinServiceMock: jasmine.SpyObj<JoinService>;

    beforeEach(() => {
        joinServiceMock = jasmine.createSpyObj('JoinService', ['join']);
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
                MatSnackBarModule
            ],
            providers: [{ provide: JoinService, useValue: joinServiceMock }],
        });
        fixture = TestBed.createComponent(JoinComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default code and name as empty strings', () => {
        expect(component.code).toBe('');
        expect(component.name).toBe('');
    });

    it('confirm method should call join service with correct parameters', () => {
        const testCode = 'TESTCODE';
        const testName = 'TESTNAME';
        component.code = testCode;
        component.name = testName;

        component.confirm();

        expect(joinServiceMock.join).toHaveBeenCalledWith(testCode, testName);
    });

    it('should update code and name based on input fields', () => {
        component.code = 'NEWCODE';
        component.name = 'NEWNAME';

        fixture.detectChanges();

        expect(component.code).toBe('NEWCODE');
        expect(component.name).toBe('NEWNAME');
    });
});
