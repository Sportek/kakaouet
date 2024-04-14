import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BackgroundComponent } from '@app/components/background/background.component';
import { GlobalLayoutComponent } from '@app/components/global-layout/global-layout.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { SelectorComponent } from '@app/components/selector/selector.component';
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
            declarations: [AdminGameHistoryComponent, GlobalLayoutComponent, BackgroundComponent, SelectorComponent, HeaderComponent],
            imports: [MatDialogModule, MatMenuModule, HttpClientModule, MatSnackBarModule],
            providers: [{ provide: HistoryService, useClass: MockHistoryService }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
