import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HistoryService } from '@app/services/history/history.service';
import { AdminGameHistoryComponent } from './admin-game-history.component';

describe('AdminGameHistoryComponent', () => {
    let component: AdminGameHistoryComponent;
    let fixture: ComponentFixture<AdminGameHistoryComponent>;
    let historyService: HistoryService;

    class MockHistoryService {
        confirmClearHistory = jasmine.createSpy('confirmClearHistory');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminGameHistoryComponent],
            imports: [MatDialogModule],
            providers: [{ provide: HistoryService, useClass: MockHistoryService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminGameHistoryComponent);
        component = fixture.componentInstance;
        historyService = TestBed.inject(HistoryService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call confirmClearHistory from HistoryService on clearHistory', () => {
        component.clearHistory();
        expect(historyService.confirmClearHistory).toHaveBeenCalled();
    });
});
