import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatMenuModule } from '@angular/material/menu';
import { BackgroundComponent } from '@app/components/background/background.component';
import { GlobalLayoutComponent } from '@app/components/global-layout/global-layout.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { QuizTermineComponent } from '@app/components/quiz-termine/quiz-termine.component';
import { SelectorComponent } from '@app/components/selector/selector.component';
import { AdminGameHistoryComponent } from './admin-game-history.component';

describe('AdminGameHistoryComponent', () => {
    let component: AdminGameHistoryComponent;
    let fixture: ComponentFixture<AdminGameHistoryComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                AdminGameHistoryComponent,
                SelectorComponent,
                QuizTermineComponent,
                BackgroundComponent,
                GlobalLayoutComponent,
                HeaderComponent,
            ],
            imports: [MatMenuModule, HttpClientTestingModule],
        });
        fixture = TestBed.createComponent(AdminGameHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
