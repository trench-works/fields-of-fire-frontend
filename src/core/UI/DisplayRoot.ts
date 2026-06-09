export interface Displayable {
    setVisible(visible: boolean): void;
    destroy(): void;
    getObject(): Phaser.GameObjects.GameObject;
}

export class DisplayRoot implements Omit<Displayable, "getObject"> {
    protected displayables: Displayable[];

    constructor() {
        this.displayables = [];
    }

    add(displayable: Displayable): void {
        this.displayables.push(displayable);
    }

    setVisible(visible: boolean): void {
        this.displayables.forEach((displayable) =>
            displayable.setVisible(visible),
        );
    }

    destroy() {
        this.displayables.forEach((displayable) => displayable.destroy());
        this.displayables = [];
    }

    getObjects(): Phaser.GameObjects.GameObject[] {
        return this.displayables.map((displayable) => displayable.getObject());
    }
}

