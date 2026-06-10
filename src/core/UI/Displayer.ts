import { BaseScene } from "../Objects";

export abstract class Displayer {
    constructor(protected readonly scene: BaseScene) {}

    abstract preRender(): this;
    abstract render(): this;
    abstract update(): this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abstract animate(...args: any[]): Promise<this>;
}

