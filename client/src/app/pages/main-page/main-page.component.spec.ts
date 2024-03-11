import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { MainPageComponent } from './main-page.component';

class MockSocketService {
    connect = jasmine.createSpy('connect');
}

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let mockSocketService: MockSocketService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MainPageComponent],

            providers: [{ provide: SocketService, useClass: MockSocketService }],
        }).compileComponents();

        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;

        mockSocketService = TestBed.inject(SocketService) as unknown as MockSocketService;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have correct team number', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.teamNumber).toEqual(109);
    });

    it('should have correct team members', () => {
        const expectedTeamMembers = ['Elie Boulanger', 'Gabriel Landry', 'Yacine Lawali', 'Dimitri Maguin', 'Mohammad Jamil Miah', 'Thomas Petrie'];
        expect(component.teamMembers).toEqual(expectedTeamMembers);
    });

    it('should call SocketService connect method when joinGame is called', () => {
        component.joinGame();
        expect(mockSocketService.connect).toHaveBeenCalled();
    });
});
