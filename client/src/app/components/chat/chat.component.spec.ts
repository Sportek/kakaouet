/* eslint-disable no-underscore-dangle */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ChatService } from '@app/services/chat/chat.service';
import { of } from 'rxjs';
import { ChatComponent } from './chat.component';

class ChatServiceMock {
    getMessageHistory = jasmine.createSpy('getMessageHistory').and.returnValue(of([]));
    sendMessage = jasmine.createSpy('sendMessage');
}

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ChatComponent],
            imports: [HttpClientTestingModule, FormsModule],
            providers: [
                {
                    provide: ChatService,
                    useClass: ChatServiceMock,
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
        it('should reset the message', () => {
            component.message = 'Bonjour';
            component.sendMessage();
            expect(component.message).toEqual('');
        });
    });
});
