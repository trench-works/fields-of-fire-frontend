import {
    ParticleAsset,
    ParticleAssetId,
} from "../../../../assets/ParticleAsset";
import { Displayer } from "../../../../core";
import { FightScene } from "../../fight.scene";
import { ParticleAnimationProps } from "./ParticleAnimation";

export enum ParticleDirectionEnum {
    UP = "up",
    DOWN = "down",
}

export class ParticleDisplayer extends Displayer<FightScene> {
    protected buffEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: FightScene) {
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
                    {}
                );
                break;
            case ParticleAssetId.DEBUFF:
                this.ParticleAnimation(
                    ParticleAssetId.DEBUFF,
                    ParticleDirectionEnum.DOWN,
                    x,
                    y,
                    {}
                );
                break;
            case ParticleAssetId.HEAL: 
                this.ParticleAnimation(
                    ParticleAssetId.HEAL,
                    ParticleDirectionEnum.UP,
                    x,
                    y,
                    {}
                )
                break;
            case ParticleAssetId.SMOKE:
                this.ParticleAnimation(
                    ParticleAssetId.SMOKE,
                    ParticleDirectionEnum.UP,
                    x,
                    y,
                    {
                        speedY : {min : 20, max : 60},
                        speedX: {min: -30, max : 30},
                        scale : {start: 2, end : 8},
                        lifespan : 2000,
                        frequency : 200
                    }
                )
            case ParticleAssetId.DUST:
                this.WindAnimation(x, y);
                break;
        }
        return this;
    }

    async ParticleAnimation(
        particleSpriteKey: ParticleAssetId,
        direction: string,
        x: number,
        y: number,
        props : ParticleAnimationProps
    ) {
        props.speedY ??= { min: 200, max: 350 };
        props.speedX ??= { min: -30, max: 30 };
        props.scale ??= { start: 2, end: 0.5 };
        props.lifespan ??= 750;
        props.frequency ??= 120;
        props.quantity ??= { min: 2, max: 0.5 };

        if(this.buffEmitter) {
            this.buffEmitter.stop();
            this.buffEmitter.destroy();
        }

        this.buffEmitter = this.scene.add.particles(
            x,
            direction === ParticleDirectionEnum.UP ? y : y - (128 * this.scene.scaleFactor / 1.5),
            ParticleAsset.getAssetKey(particleSpriteKey),
            {
                speedY:
                    direction === ParticleDirectionEnum.UP
                        ? { min: props.speedY.min* -1, max: props.speedY.max * -1 }
                        : { min: props.speedY.min, max: props.speedY.max },
                speedX: props.speedX,

                scale: props.scale,
                alpha: { start: 1, end: 0 },

                lifespan: props.lifespan,
                frequency: props.frequency,
                quantity: props.quantity,

                angle: { min: -100, max: -80 },

                emitting: false,
            },
        );

        this.buffEmitter.setDepth((Math.max(x,y) * 10) + 1)
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

    async WindAnimation(x: number, y: number): Promise<void> {
        if (this.buffEmitter) {
            this.buffEmitter.stop();
            this.buffEmitter.destroy();
        }

        this.buffEmitter = this.scene.add.particles(
            x,
            y,
            ParticleAsset.getAssetKey(ParticleAssetId.DUST),
            {
                speedX: { min: 40, max: 100 },
                speedY: { min: -15, max: 15 },
                accelerationY: { min: -20, max: 20 },
                scale: { start: 0.3, end: 1.2 },
                alpha: { start: 0.6, end: 0 },
                lifespan: { min: 1500, max: 3000 },
                frequency: 80,
                quantity: { min: 1, max: 3 },
                rotate: { min: -15, max: 15 },
                emitting: false,
            },
        );

        this.buffEmitter.addEmitZone(
            new Phaser.GameObjects.Particles.Zones.RandomZone({
                getRandomPoint: (point: any) => {
                    point.x = Phaser.Math.Between(-100, 0);
                    point.y = Phaser.Math.Between(-20, 20);
                    return point;
                },
            }),
        );

    this.buffEmitter.setDepth((Math.max(x, y) * 10) + 1);

    await new Promise<void>((resolve) => {
        this.buffEmitter.start();

        setTimeout(() => {
            this.buffEmitter.stop();
            resolve();
        }, 3000);
    });
}
}

