import { Timer } from './Timer';

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
        jest.advanceTimersByTime(3000); 
        timer.togglePlayPause(); 
        jest.advanceTimersByTime(3000); 
        timer.togglePlayPause(); 
        jest.advanceTimersByTime(7000); 

        expect(mockIncrement).toHaveBeenLastCalledWith(0); 
        expect(mockIncrement).toHaveBeenCalledTimes(12); 
    });

    it('should stop and reset the timer', () => {
        const mockIncrement = jest.fn();
        const timer = new Timer(10, { whenIncrement: mockIncrement });

        timer.start();
        jest.advanceTimersByTime(3000); 
        timer.stop();

        expect(mockIncrement).toHaveBeenLastCalledWith(0);
        expect(timer.getTimer()).toBe(0); 
    });

    it('should accelerate the countdown', () => {
        const mockIncrement = jest.fn();

        const timer = new Timer(10, {
            isAccelerated: true,
            accelerationMultiplicator: 2, 
            whenIncrement: mockIncrement,
        });

        timer.start();
        jest.advanceTimersByTime(2500); 

        expect(mockIncrement).toHaveBeenCalledTimes(6); 
    });

    
        it('should accelerate the timer countdown', () => {
            const mockIncrement = jest.fn();
    
            const initialTick = 1000; 
            const accelerationMultiplicator = 4; 
            const acceleratedTick = initialTick / accelerationMultiplicator;
    
            const timer = new Timer(10, {
                whenIncrement: mockIncrement,
            });
    
            timer.start();
            jest.advanceTimersByTime(3000); 
            expect(mockIncrement).toHaveBeenCalledTimes(4); 
    
            timer.speedUp();
            jest.advanceTimersByTime(acceleratedTick * 2); 
    
            expect(mockIncrement).toHaveBeenCalledTimes(7); 
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

