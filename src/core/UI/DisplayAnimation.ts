import { AnimationConfiguration } from "../Assets/Asset";
import { BaseScene } from "../Objects";
import { Position } from "../Types";
import { AnimationUtils } from "../Utils";

export class DisplayAnimation {
    constructor(
        protected readonly scene: BaseScene,
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

    async animate(
        { x, y }: Position,
        position?: {
            scale?: number;
            depth: number;
            origin?: Position;
            direction?: number;
        },
    ): Promise<this> {
        return new Promise<this>((resolve) => {
            const { frameTime } = this.frameConfig;

            const sprite = this.scene.physics.add.sprite(x, y, this.assetKey);

            this.scene.anims.get(this.assetKey);

            if (position?.direction !== undefined) {
                sprite.setAngle(position?.direction);
            }
            if (position?.depth !== undefined) {
                sprite.setDepth(position?.depth);
            }
            if (position?.scale !== undefined) {
                sprite.setScale(position?.scale);
            }
            if (position?.origin) {
                sprite.setOrigin(position.origin.x, position.origin.y);
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

