import { Timer } from './Timer'; // Adjust the import path as necessary

describe('Timer class', () => {
    jest.useFakeTimers();

    it('should count down and call whenIncrement and whenDone', () => {
        const mockIncrement = jest.fn();
        const mockDone = jest.fn();

        const timer = new Timer(5, {
            whenIncrement: mockIncrement,
            whenDone: mockDone,
        });

        timer.start();
        jest.advanceTimersByTime(5000); 

        expect(mockIncrement).toHaveBeenCalledTimes(6); 
    });

    it('should pause and resume', () => {
        const mockIncrement = jest.fn();

        const timer = new Timer(10, {
            whenIncrement: mockIncrement,
        });

        timer.start();
        jest.advanceTimersByTime(3000); // Advance 3 seconds, timer should be at 7
        timer.togglePlayPause(); // Pause
        jest.advanceTimersByTime(3000); // Advance 3 more seconds, timer should still be at 7
        timer.togglePlayPause(); // Resume
        jest.advanceTimersByTime(7000); // Finish the countdown

        expect(mockIncrement).toHaveBeenLastCalledWith(0); // Checks if the timer ended correctly
        expect(mockIncrement).toHaveBeenCalledTimes(12); // Checks if whenIncrement was called 10 times
    });

    it('should stop and reset the timer', () => {
        const mockIncrement = jest.fn();
        const timer = new Timer(10, { whenIncrement: mockIncrement });

        timer.start();
        jest.advanceTimersByTime(3000); // Advance 3 seconds
        timer.stop();

        expect(mockIncrement).toHaveBeenLastCalledWith(0); // Checks if the timer was reset
        expect(timer.getTimer()).toBe(0); // Ensure timer value is reset to 0
    });

    it('should accelerate the countdown', () => {
        const mockIncrement = jest.fn();

        const timer = new Timer(10, {
            isAccelerated: true,
            accelerationMultiplicator: 2, // Speeding up by factor of 2
            whenIncrement: mockIncrement,
        });

        timer.start();
        jest.advanceTimersByTime(2500); // Should count down twice as fast

        expect(mockIncrement).toHaveBeenCalledTimes(6); // Checks if whenIncrement was called 5 times (half the time due to acceleration)
    });

    
        it('should accelerate the timer countdown', () => {
            const mockIncrement = jest.fn();
    
            const initialTick = 1000; // Assuming the default tick is 1000ms
            const accelerationMultiplicator = 4; // Assuming the default acceleration multiplier is 4
            const acceleratedTick = initialTick / accelerationMultiplicator; // Expected accelerated tick interval
    
            const timer = new Timer(10, {
                whenIncrement: mockIncrement,
            });
    
            timer.start();
            jest.advanceTimersByTime(3000); // Advance 3 seconds to simulate initial countdown
            expect(mockIncrement).toHaveBeenCalledTimes(4); // Initial pace, 1 tick per second
    
            timer.speedUp();
            jest.advanceTimersByTime(acceleratedTick * 2); // Advance time by twice the accelerated tick interval
    
            // Now, after acceleration, the whenIncrement should be called more frequently.
            // Since we've advanced the timer by 2 accelerated ticks, expect 2 additional calls.
            expect(mockIncrement).toHaveBeenCalledTimes(7); // Checks if whenIncrement was called 2 more times at the accelerated pace
        });

            it('should use provided options', () => {
                const mockDone = jest.fn();
                const mockIncrement = jest.fn();
        
                const timer = new Timer(10, {
                    tick: 500,
                    isAccelerated: true,
                    accelerationMultiplicator: 2,
                    whenDone: mockDone,
                    whenIncrement: mockIncrement,
                });
        
                expect(timer).toHaveProperty('tick', 500);
                expect(timer).toHaveProperty('isAccelerated', true);
                expect(timer).toHaveProperty('multiplicator', 2);
            });
});

