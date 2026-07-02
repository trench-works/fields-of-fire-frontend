import { Scene } from "phaser";

export type GameObjectProps = {
    //input: Input;
    scene: Scene;
};

export abstract class GameObject {
    //protected input: Input;

    protected scene: Scene;

    constructor({ scene }: GameObjectProps) {
        //this.input = input;
        this.scene = scene;
    }

    abstract recalculate(): Promise<void>;
}

