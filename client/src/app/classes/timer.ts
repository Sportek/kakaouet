const DEFAULT_TICK = 1000;
const DEFAULT_MULTIPLICATOR = 1.2;

export class Timer {
    private timer: number;
    private tick: number;
    private isAccelerated: boolean;
    private multiplicator: number;
    private interval: number | undefined;
    private whenDone: () => void;
    constructor(countDown: number, options?: { tick?: number; isAccelerated?: boolean; accelerationMultiplicator?: number; whenDone?: () => void }) {
        this.timer = countDown;
        this.isAccelerated = options?.isAccelerated || false;
        this.tick = options?.tick || DEFAULT_TICK;
        this.multiplicator = options?.accelerationMultiplicator || DEFAULT_MULTIPLICATOR;
        this.whenDone =
            options?.whenDone ||
            (() => {
                return;
            });
    }

    start() {
        this.interval = window.setInterval(
            () => {
                this.timer -= 1;
                if (this.timer <= 0) {
                    this.stop();
                }
            },
            this.tick * (this.isAccelerated ? 1 / this.multiplicator : 1),
        );
    }

    stop() {
        this.timer = 0;
        this.whenDone();
        clearInterval(this.interval);
        this.interval = undefined;
    }

    getTimer() {
        return this.timer;
    }
}
