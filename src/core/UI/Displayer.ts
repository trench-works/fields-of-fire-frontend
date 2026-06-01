export abstract class Displayer {
    constructor(protected readonly scene: Phaser.Scene) {}

    abstract prepare(): void;
    abstract displayData(): void;
}

