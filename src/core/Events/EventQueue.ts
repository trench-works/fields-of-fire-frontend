export class EventQueue<T> {
    private readonly events: T[];
    private isAwaiting: boolean;

    constructor(private readonly treate: (event: T) => Promise<void>) {
        this.events = [];
        this.isAwaiting = false;
    }

    add(event: T): this {
        this.events.push(event);
        this.treateEvents();
        return this;
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
        }
    }
}

