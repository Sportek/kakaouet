import { Timer } from '@app/classes/timer';

const INITIAL_COUNTDOWN = 10;
const INITIAL_TICK = 1000;
const ACCELERATION_MULTIPLICATOR = 4;
const ACCELERATED_TICK = INITIAL_TICK / ACCELERATION_MULTIPLICATOR;
const PAUSE_DURATION = 3000;
const RESUME_DURATION = 7000;
const TIME_ADVANCED_FOR_ACCELERATION_TEST = 2500;
const TICK_COUNT_AFTER_3_SECONDS = 4;
const TICK_COUNT_AFTER_ACCELERATION = 6;
const CUSTOM_TICK = 500;
const CUSTOM_MULTIPLICATOR = 2;

describe('Timer class', () => {
    jest.useFakeTimers();

    it('should count down and call whenIncrement and whenDone', () => {
        const mockIncrement = jest.fn();
        const mockDone = jest.fn();

        const timer = new Timer(INITIAL_COUNTDOWN, {
            whenIncrement: mockIncrement,
            whenDone: mockDone,
        });

        timer.start();
        jest.advanceTimersByTime(INITIAL_TICK * INITIAL_COUNTDOWN);

        expect(mockIncrement).toHaveBeenCalledTimes(INITIAL_COUNTDOWN + 1);
    });

    it('should pause and resume', () => {
        const mockIncrement = jest.fn();

        const timer = new Timer(INITIAL_COUNTDOWN, {
            whenIncrement: mockIncrement,
        });

        timer.start();
        jest.advanceTimersByTime(PAUSE_DURATION);
        timer.togglePlayPause();
        jest.advanceTimersByTime(PAUSE_DURATION);
        timer.togglePlayPause();
        jest.advanceTimersByTime(RESUME_DURATION);

        const expectedTickCount = INITIAL_COUNTDOWN + 1;
        expect(mockIncrement).toHaveBeenLastCalledWith(0);
        expect(mockIncrement).toHaveBeenCalledTimes(expectedTickCount + 1);
    });

    it('should stop and reset the timer', () => {
        const mockIncrement = jest.fn();
        const timer = new Timer(INITIAL_COUNTDOWN, { whenIncrement: mockIncrement });

        timer.start();
        jest.advanceTimersByTime(PAUSE_DURATION);
        timer.stop();

        expect(mockIncrement).toHaveBeenLastCalledWith(0);
        expect(timer.getTimer()).toBe(0);
    });

    it('should accelerate the countdown', () => {
        const mockIncrement = jest.fn();

        const timer = new Timer(INITIAL_COUNTDOWN, {
            isAccelerated: true,
            accelerationMultiplicator: ACCELERATION_MULTIPLICATOR,
            whenIncrement: mockIncrement,
        });

        timer.start();
        jest.advanceTimersByTime(TIME_ADVANCED_FOR_ACCELERATION_TEST);

        expect(mockIncrement).toHaveBeenCalledTimes(TICK_COUNT_AFTER_ACCELERATION + ACCELERATION_MULTIPLICATOR + 1);
    });

    it('should accelerate the timer countdown', () => {
        const mockIncrement = jest.fn();

        const timer = new Timer(INITIAL_COUNTDOWN, {
            whenIncrement: mockIncrement,
        });

        timer.start();
        jest.advanceTimersByTime(INITIAL_TICK * 3);
        expect(mockIncrement).toHaveBeenCalledTimes(TICK_COUNT_AFTER_3_SECONDS);

        timer.speedUp();
        jest.advanceTimersByTime(ACCELERATED_TICK * 2);

        expect(mockIncrement).toHaveBeenCalledTimes(TICK_COUNT_AFTER_ACCELERATION + 1);
    });

    it('should use provided options', () => {
        const mockDone = jest.fn();
        const mockIncrement = jest.fn();

        const timer = new Timer(INITIAL_COUNTDOWN, {
            tick: CUSTOM_TICK,
            isAccelerated: true,
            accelerationMultiplicator: CUSTOM_MULTIPLICATOR,
            whenDone: mockDone,
            whenIncrement: mockIncrement,
        });

        expect(timer).toHaveProperty('tick', CUSTOM_TICK);
        expect(timer).toHaveProperty('isAccelerated', true);
        expect(timer).toHaveProperty('multiplicator', CUSTOM_MULTIPLICATOR);
    });
});
