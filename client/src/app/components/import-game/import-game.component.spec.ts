import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FileService } from '@app/services/import/file.service';
import { ImportGameComponent } from './import-game.component';

describe('ImportGameComponent', () => {
    let component: ImportGameComponent;
    let fixture: ComponentFixture<ImportGameComponent>;
    let importServiceSpy: jasmine.SpyObj<FileService>;

    beforeEach(async () => {
        importServiceSpy = jasmine.createSpyObj('ImportService', ['onFileUpload']);
        importServiceSpy.onFileUpload.and.returnValue(Promise.resolve(true));

        await TestBed.configureTestingModule({
            declarations: [ImportGameComponent],
            imports: [HttpClientTestingModule, MatDialogModule, MatIconModule],
            providers: [{ provide: FileService, useValue: importServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(ImportGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call importService.onFileUpload', async () => {
        const file = new File([''], 'filename');
        const event = { target: { files: [file] } } as unknown as Event;
        await component.onFileUpload(event);
        expect(importServiceSpy.onFileUpload).toHaveBeenCalled();
    });
});
