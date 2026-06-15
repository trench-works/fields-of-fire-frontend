export class EventQueue<T> {
    protected readonly events: T[];
    protected isAwaiting: boolean;

    protected completionListener: (() => void)[] = [];

    constructor(private readonly treate: (event: T) => Promise<void>) {
        this.events = [];
        this.isAwaiting = false;
    }

    add(event: T): this {
        this.events.push(event);
        this.treateEvents();
        return this;
    }

    async waitForCompletion(): Promise<void> {
        if (!this.events.length) {
            return;
        }
        return new Promise<void>((resolve) => {
            this.completionListener.push(resolve);
        });
    }

    private async treateEvents() {
        if (this.isAwaiting) {
            return;
        }
        const event = this.events.shift();
        if (!event) {
            return;
        }

        this.isAwaiting = true;
        await this.treate(event);
        this.isAwaiting = false;

        if (this.events.length) {
            this.treateEvents();
        } else {
            this.completionListener.forEach((listener) => listener());
            this.completionListener = [];
        }
    }
}

