import { PlacementOrigin, Position, Size } from "../Types";

export interface Displayable {
    setVisible(visible: boolean): void;
    destroy(): void;
    getObject(): Phaser.GameObjects.GameObject;
    place(position: Position, size: Size, origin: PlacementOrigin): void;
    setDepth(depth: number): this;
    blur(): this;
    unblur(): this;
}

export class DisplayRoot implements Omit<
    Displayable,
    "getObject" | "place" | "setDepth" | "blur" | "unblur"
> {
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

    blur(): this {
        //this.displayables.forEach((displayable) => displayable.blur());
        return this;
    }

    unblur(): this {
        //this.displayables.forEach((displayable) => displayable.unblur());
        return this;
    }

    destroy() {
        this.displayables.forEach((displayable) => displayable.destroy());
        this.displayables = [];
    }

    getObjects(): Phaser.GameObjects.GameObject[] {
        return this.displayables.map((displayable) => displayable.getObject());
    }
}

