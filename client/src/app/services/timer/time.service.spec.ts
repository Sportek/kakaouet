/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';

import { TimeService } from './time.service';
import { Timer } from './timer';

describe('TimeService', () => {
    let service: TimeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create and start a timer', (done) => {
        const timer = new Timer(2, { whenDone: done });
        service.createTimer('testTimer', timer);
        expect(service).toBeTruthy();
        expect(service['timerMap'].has('testTimer')).toBeTrue();
    });

    it('should stop and remove a timer', () => {
        const timer = new Timer(2);
        service.createTimer('testTimer', timer);
        service.stopTimer('testTimer');
        expect(service['timerMap'].has('testTimer')).toBeFalse();
    });

    it('should count down and stop', (done) => {
        const timer = new Timer(2, { whenDone: done });
        timer.start();
        setTimeout(() => {
            expect(timer.getTimer()).toBe(0);
            // Comme le temps est set à 2 (et change à tous les 1000ms), on est supposé avoir terminé après (2000ms, donc on check à 3000ms)
        }, 3000);
    });

    it('should accelerate if isAccelerated is true', (done) => {
        const timer = new Timer(50, { whenDone: done, isAccelerated: true, accelerationMultiplicator: 2, tick: 100 });
        timer.start();
        setTimeout(() => {
            expect(timer.getTimer()).toBeLessThan(30);
        }, 2000);
    });
});
