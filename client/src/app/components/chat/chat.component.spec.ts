/* eslint-disable no-underscore-dangle */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { GameService } from '@app/services/game/game.service';
import { ChatComponent } from './chat.component';

class MockGameService {
    game = {
        users: [
            { _id: '123', name: 'John Doe' },
            { _id: '456', name: 'Jane Doe' },
        ],
    };

    // eslint-disable-next-line no-unused-vars
    sendMessage(message: string) {
        // Simuler l'envoi d'un message
    }
}

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ChatComponent],
            imports: [HttpClientTestingModule, FormsModule],
            providers: [{ provide: GameService, useClass: MockGameService }],
        });
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the correct game user by id', () => {
        // @ts-ignore
        component.gameService = new MockGameService();
        const user = component.getGameUser('123');
        expect(user).toBeTruthy();
        // @ts-ignore
        expect(user._id).toEqual('123');
        // @ts-ignore
        expect(user.name).toEqual('John Doe');
    });

    it('should send a message and clear the message input', () => {
        const mockGameService = new MockGameService();
        spyOn(mockGameService, 'sendMessage');

        // @ts-ignore
        component.gameService = mockGameService;
        component.message = 'Hello world!';
        component.sendMessage();

        expect(mockGameService.sendMessage).toHaveBeenCalledWith('Hello world!');
        expect(component.message).toBe('');
    });
});
