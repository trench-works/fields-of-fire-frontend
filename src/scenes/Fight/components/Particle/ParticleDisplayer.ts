import {
    ParticleAsset,
    ParticleAssetId,
} from "../../../../assets/ParticleAsset";
import { BaseScene, Displayer } from "../../../../core";

export enum ParticleDirectionEnum {
    UP = "up",
    DOWN = "down",
}

export class ParticleDisplayer extends Displayer {
    protected buffEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: BaseScene) {
        super(scene);
    }

    preRender(): this {
        return this;
    }

    render(): this {
        return this;
    }

    update(): this {
        return this;
    }

    async animate(
        particleKey: ParticleAssetId,
        x: number,
        y: number,
    ): Promise<this> {
        console.log("ANIMATE INTIMIDATION");
        switch (particleKey) {
            case ParticleAssetId.BOOST:
                this.ParticleAnimation(
                    ParticleAssetId.BOOST,
                    ParticleDirectionEnum.UP,
                    x,
                    y,
                );
                break;
        }
        return this;
    }

    async ParticleAnimation(
        particleSpriteKey: ParticleAssetId,
        direction: string,
        x: number,
        y: number,
    ) {
        this.buffEmitter = this.scene.add.particles(
            x,
            y,
            ParticleAsset.getAssetKey(particleSpriteKey),
            {
                speedY:
                    direction === ParticleDirectionEnum.UP
                        ? { min: -200, max: -350 }
                        : { min: 200, max: 350 },
                speedX: { min: -30, max: 30 },

                scale: { start: 2, end: 0.5 },
                alpha: { start: 1, end: 0 },

                lifespan: 800,
                frequency: 40,
                quantity: { min: 2, max: 4 },

                angle: { min: -100, max: -80 },

                emitting: false,
            },
        );

        await new Promise<void>((resolve) => {
            this.buffEmitter.addEmitZone(
                new Phaser.GameObjects.Particles.Zones.RandomZone({
                    getRandomPoint: (point: any) => {
                        point.x = Phaser.Math.Between(-30, 30);
                        point.y = Phaser.Math.Between(0, 20);
                        return point;
                    },
                }),
            );

            this.buffEmitter.start();

            setTimeout(() => {
                this.buffEmitter.stop();
                resolve();
            }, 2 * 1000);
        });
    }
}

