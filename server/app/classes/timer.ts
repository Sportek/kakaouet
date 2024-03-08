const DEFAULT_TICK = 1000;
const DEFAULT_MULTIPLICATOR = 4;

export class Timer {
    private timer: number;
    private tick: number;
    private isAccelerated: boolean;
    private multiplicator: number;
    private interval: NodeJS.Timer;
    private isPaused: boolean = false;
    private whenDone: () => void;
    private whenIncrement: (timer: number) => void;
    constructor(
        countDown: number,
        options?: {
            tick?: number;
            isAccelerated?: boolean;
            accelerationMultiplicator?: number;
            whenDone?: () => void;
            whenIncrement?: (timer: number) => void;
        },
    ) {
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
        this.interval = setInterval(
            () => {
                if (this.timer <= 0) {
                    this.stop();
                }
                this.whenIncrement(this.timer);
                this.timer -= 1;
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

    togglePlayPause() {
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
        this.isAccelerated = true;
        this.start();
    }
}
