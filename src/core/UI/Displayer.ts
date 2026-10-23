import { BaseScene } from "../Objects";

export abstract class Displayer<Scene extends BaseScene> {
    constructor(protected readonly scene: Scene) {}

    abstract preRender(): this;
    abstract render(): this;
    abstract update(): this;
}

