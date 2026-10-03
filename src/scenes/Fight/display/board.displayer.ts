import { Displayer } from "../../../core";
import { FightScene } from "../fight.scene";
import { GroundDisplayer } from "./ground.displayer";
import { WallDisplayer } from "./wall.displayer";

export class BoardDisplayer extends Displayer<FightScene> {
    constructor(
        scene: FightScene,
        private readonly groundDisplayer: GroundDisplayer,
        private readonly wallDisplayer: WallDisplayer,
    ) {
        super(scene);
    }

    scale(): this {
        this.groundDisplayer.scale();
        this.wallDisplayer.scale();
        return this;
    }

    preRender(): this {
        this.groundDisplayer.preRender();
        this.wallDisplayer.preRender();
        return this;
    }

    render(): this {
        this.groundDisplayer.render();
        this.wallDisplayer.render();
        return this;
    }

    update(): this {
        this.groundDisplayer.update();
        this.wallDisplayer.update();
        return this;
    }

    reset(): this {
        this.destroy().render().update();
        return this;
    }

    destroy(): this {
        this.groundDisplayer.clean();
        this.wallDisplayer.clean();
        return this;
    }

    async animate(): Promise<this> {
        return this;
    }
}

