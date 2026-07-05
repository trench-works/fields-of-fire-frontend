import { Sound } from "../Types/Sound";
import { SoundLevel } from "../Utils";
import { SoundParam } from "../Utils/SoundLevel";
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
        console.log(
            "SoundEffect constructor: ",
            SoundLevel.get(SoundParam.EFFECT),
            this.sound,
        );
        this.sound.setVolume(SoundLevel.get(SoundParam.EFFECT));
    }

    play(): this {
        this.sound.setVolume(SoundLevel.get(SoundParam.EFFECT));
        this.sound.play();
        this.sound.on("complete", () => this.destroy());
        return this;
    }

    destroy(): this {
        this.sound.destroy();
        return this;
    }
}

