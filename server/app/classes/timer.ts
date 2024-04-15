const DEFAULT_TICK = 1000;
const DEFAULT_MULTIPLICATOR = 4;
interface TimerOptions {
    tick?: number;
    isAccelerated?: boolean;
    accelerationMultiplicator?: number;
    whenDone?: () => void;
    whenIncrement?: (timer: number) => void;
}

export class Timer {
    private timer: number;
    private tick: number;
    private isAccelerated: boolean;
    private multiplicator: number;
    private interval: NodeJS.Timer;
    private isPaused: boolean = false;
    private isActive: boolean = false;
    private whenDone: () => void;
    private whenIncrement: (timer: number) => void;
    constructor(countDown: number, options?: TimerOptions) {
        this.timer = countDown;
        this.isAccelerated = options?.isAccelerated || false;
        this.tick = options?.tick || DEFAULT_TICK;
        this.multiplicator = options?.accelerationMultiplicator || DEFAULT_MULTIPLICATOR;
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- On doit être certain que la fonction est définie
        this.whenDone = options?.whenDone ?? (() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- On doit être certain que la fonction est définie
        this.whenIncrement = options?.whenIncrement ?? (() => {});
    }

    start() {
        if (this.interval) clearInterval(this.interval);
        this.isActive = true;
        this.whenIncrement(this.timer);
        this.interval = setInterval(
            () => {
                this.timer -= 1;
                if (this.timer < 0) return this.stop();
                this.whenIncrement(this.timer);
            },
            (this.tick - 1) * (this.isAccelerated ? 1 / this.multiplicator : 1),
        );
    }

    stop() {
        if (!this.isActive) return;
        this.timer = 0;
        clearInterval(this.interval);
        this.interval = undefined;
        this.whenIncrement(this.timer);
        this.whenDone();
        this.isActive = false;
    }

    togglePlayPause() {
        if (this.timer === 0) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            clearInterval(this.interval);
        } else {
            this.start();
        }
    }

    getTimer() {
        return this.timer;
    }

    speedUp() {
        if (this.timer === 0) return;
        this.isAccelerated = true;
        this.start();
    }
}
