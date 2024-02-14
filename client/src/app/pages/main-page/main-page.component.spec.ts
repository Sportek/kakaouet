import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackgroundComponent } from '@app/components/background/background.component';
import { MainPageComponent } from './main-page.component';

describe('JoinComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MainPageComponent, BackgroundComponent],
        });
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
