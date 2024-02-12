import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImportGameComponent } from './import-game.component';

describe('ImportGameComponent', () => {
    let component: ImportGameComponent;
    let fixture: ComponentFixture<ImportGameComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ImportGameComponent],
            imports: [HttpClientTestingModule],
            providers: [MatSnackBar],
        });
        fixture = TestBed.createComponent(ImportGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
