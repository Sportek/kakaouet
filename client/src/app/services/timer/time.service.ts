import { Injectable } from '@angular/core';
import { Timer } from '@app/classes/timer';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    private timerMap = new Map<string, Timer>();

    createTimer(name: string, timer: Timer) {
        this.timerMap.set(name, timer);
        timer.start();
        return timer;
    }

    stopTimer(name: string) {
        this.timerMap.get(name)?.stop();
        this.timerMap.delete(name);
    }
}
