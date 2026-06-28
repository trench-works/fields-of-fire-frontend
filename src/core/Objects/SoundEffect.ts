import { Sound } from "../Types/Sound";
import { BaseScene } from "./BaseScene";

export class SoundEffect {
    sound: Sound;

    constructor(
        private readonly scene: BaseScene,
        assetKey: string,
        //{ x, y }: Position,
    ) {
        this.sound = this.scene.sound.add(assetKey, {
            // source: { //FIXME: c'est buggé ca marche pas
            //     x,
            //     y,
            // },
        });
        this.sound.setVolume(0.4);
    }

    play(): this {
        this.sound.play();
        this.sound.on("complete", () => this.destroy());
        return this;
    }

    destroy(): this {
        this.sound.destroy();
        return this;
    }
}

