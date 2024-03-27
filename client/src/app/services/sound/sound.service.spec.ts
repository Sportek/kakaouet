import { TestBed } from '@angular/core/testing';

import { SoundType } from '@common/game-types';
import { SoundService } from './sound.service';

describe('SoundService', () => {
    let service: SoundService;
    let mockAudio: jasmine.SpyObj<HTMLAudioElement>;

    beforeEach(() => {
        mockAudio = jasmine.createSpyObj('HTMLAudioElement', ['play', 'pause', 'loop']);
        spyOn(window, 'Audio').and.returnValue(mockAudio);
        TestBed.configureTestingModule({});
        service = TestBed.inject(SoundService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should start playing sound', () => {
        service.startPlayingSound(SoundType.PlayingRoom);
        expect(service['playingSound']).toBeDefined();
        expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should stop playing sound', () => {
        service.startPlayingSound(SoundType.PlayingRoom);
        service.stopPlayingSound();
        expect(mockAudio.pause).toHaveBeenCalled();
    });
});
