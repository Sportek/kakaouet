/* eslint-disable no-underscore-dangle */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { GameService } from '@app/services/game/game.service';
import { Game, GameUser } from '@common/types';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let gameService: GameService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ChatComponent],
            imports: [HttpClientTestingModule, FormsModule],
        });
        fixture = TestBed.createComponent(ChatComponent);
        gameService = TestBed.inject(GameService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should return the correct game user by id', () => {
        component.gameService.game = {
            users: [{ _id: '123', name: 'John Doe' } as GameUser, { _id: '456', name: 'Jane Doe' } as GameUser],
        } as Game;

        const user = component.getGameUser('123') as GameUser;

        expect(user._id).toEqual('123');
        expect(user.name).toEqual('John Doe');
    });

    it('should return empty user if incorrect id', () => {
        component.gameService.game = {
            users: [{ _id: '123', name: 'John Doe' } as GameUser, { _id: '456', name: 'Jane Doe' } as GameUser],
        } as Game;

        const user = component.getGameUser('155');

        expect(user).toBeUndefined();
    });

    it('should send a message and clear the message input', () => {
        const sendMessageSpy = spyOn(gameService, 'sendMessage');

        component.message = 'Hello world!';
        component.sendMessage();

        expect(sendMessageSpy).toHaveBeenCalledWith('Hello world!');
        expect(component.message).toBe('');
    });
});
