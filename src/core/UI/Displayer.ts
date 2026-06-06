export abstract class Displayer {
    constructor(protected readonly scene: Phaser.Scene) {}

    abstract preRender(): this;
    abstract render(): this;
    abstract update(): this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abstract animate(...args: any[]): this;
}

