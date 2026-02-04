import { Scene } from "phaser";
import { Position } from "./Position";

export type GameObjectProps = {
    //input: Input;
    scene: Scene;
};

export type Input = {
    keyboard: {
        on: (handler: (key: string) => void) => void;
    };
    mouse: {
        onClick: (handler: (position: Position) => void) => void;
    };
};


export abstract class GameObject {
    //protected input: Input;

    protected scene: Scene;

    constructor({scene }: GameObjectProps) {
        //this.input = input;
        this.scene = scene;
    }

    abstract recalculate(): Promise<void>;
}