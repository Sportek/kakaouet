import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FileService } from '@app/services/import/file.service';

@Component({
    selector: 'app-import-game',
    templateUrl: './import-game.component.html',
    styleUrls: ['./import-game.component.scss'],
})
export class ImportGameComponent {
    constructor(
        public dialog: MatDialog,
        private fileService: FileService,
    ) {}

    async onFileUpload(event: Event): Promise<boolean> {
        const response = await this.fileService.onFileUpload(event);
        const input = event.target as HTMLInputElement;
        input.value = '';
        return response;
    }
}
