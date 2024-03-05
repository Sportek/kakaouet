/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';

import { Timer } from '@app/classes/timer';
import { TimeService } from './time.service';

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

    it('should count down and stop', fakeAsync(() => {
        const timer = new Timer(2, {
            whenDone: () => {
                return true;
            },
        });
        timer.start();
        setTimeout(() => {
            expect(timer.getTimer()).toBe(0);
        }, 3000);

        flush();
    }));

    it('should accelerate if isAccelerated is true', fakeAsync(() => {
        const timer = new Timer(50, {
            whenDone: () => {
                return true;
            },
            isAccelerated: true,
            accelerationMultiplicator: 2,
            tick: 100,
        });
        timer.start();
        tick(2000);
        discardPeriodicTasks();

        expect(timer.getTimer()).toBeLessThan(30);
    }));
});
