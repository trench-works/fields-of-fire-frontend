import { AnimationConfiguration } from "../Assets/Asset";
import { BaseScene } from "../Objects";
import { Position } from "../Types";
import { AnimationUtils } from "../Utils";

export class DisplayAnimation {
    constructor(
        protected readonly scene: BaseScene,
        protected readonly sizing: Position & {
            scale?: number;
            depth: number;
            offset?: Position;
        },
        protected readonly assetKey: string,
        protected readonly frameConfig: AnimationConfiguration,
        protected readonly keys?: number[],
    ) {
        if (!this.scene.anims.get(assetKey)) {
            const frames: Phaser.Types.Animations.AnimationFrame[] = [];
            const { frameTime } = frameConfig;
            for (let i = 0; i < frameTime.length; i++) {
                if (keys && !keys.includes(i)) {
                    continue;
                }
                frames.push({
                    key: assetKey,
                    frame: i,
                    duration: frameTime[i],
                });
            }

            this.scene.anims.create({
                key: assetKey,
                frames,
            });
        }
    }

    async animate(): Promise<this> {
        return new Promise<this>((resolve) => {
            const { frameTime } = this.frameConfig;

            const sprite = this.scene.physics.add.sprite(
                this.sizing.x,
                this.sizing.y,
                this.assetKey,
            );

            this.scene.anims.get(this.assetKey);

            sprite.setDepth(this.sizing.depth);
            if (this.sizing.scale) {
                sprite.setScale(this.sizing.scale);
            }
            if (this.sizing.offset) {
                sprite.setOrigin(this.sizing.offset.x, this.sizing.offset.y);
            }
            sprite.play(this.assetKey);

            setTimeout(
                () => {
                    sprite.stop();
                    sprite.destroy();
                    resolve(this);
                },
                AnimationUtils.getFullAnimationTime(
                    frameTime.filter((_, i) => !this.keys?.includes?.(i)),
                ),
            );
        });
    }
}

