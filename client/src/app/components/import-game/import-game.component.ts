import { Component } from '@angular/core';
import { FileService } from '@app/services/import/file.service';

@Component({
    selector: 'app-import-game',
    templateUrl: './import-game.component.html',
    styleUrls: ['./import-game.component.scss'],
})
export class ImportGameComponent {
    constructor(
        private fileService: FileService,
    ) {}

    onFileUpload(event: Event): void {
        this.fileService.onFileUpload(event).subscribe((success) => {
            if (success) {
                const input = event.target as HTMLInputElement;
                input.value = '';
            }
        });
    }
}
