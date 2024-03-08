/* eslint-disable no-underscore-dangle */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { GameService } from '@app/services/game/game.service';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let gameServiceMock: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        gameServiceMock = jasmine.createSpyObj('GameService', ['sendMessage']);

        TestBed.configureTestingModule({
            declarations: [ChatComponent],
            imports: [HttpClientTestingModule, FormsModule],
            providers: [
                {
                    provide: GameService,
                    useValue: gameServiceMock,
                },
            ],
        });
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('sendMessage', () => {
        it('should send the message', () => {
            component.message = 'Bonjour';
            component.sendMessage();
            expect(gameServiceMock.sendMessage).toHaveBeenCalled();
        });

        it('should reset the message', () => {
            component.message = 'Bonjour';
            component.sendMessage();
            expect(component.message).toEqual('');
        });
    });
});
