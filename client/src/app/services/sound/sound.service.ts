import { Injectable } from '@angular/core';
import { SoundType } from '@common/game-types';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    private playingSound: HTMLAudioElement;

    startPlayingSound(sound: SoundType, repeat: boolean = false): void {
        const audio = new Audio(sound);
        if (sound === SoundType.PlayingRoom) this.playingSound = audio;
        audio.play();
        audio.loop = repeat;
    }

    stopPlayingSound(): void {
        if (this.playingSound) this.playingSound.pause();
    }
}
