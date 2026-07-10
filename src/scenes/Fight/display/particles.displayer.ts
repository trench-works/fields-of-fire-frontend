import { ParticleAsset, ParticleAssetId } from "../../../assets/ParticleAsset";
import { BACKGROUND_LEVELS_OFFSET, Depth, Displayer } from "../../../core";
import { FightScene } from "../fight.scene";
import { ParticleAnimationProps } from "./base/particles.animation";

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
        depth: number,
    ): Promise<this> {
        console.log("ANIMATE INTIMIDATION");
        switch (particleKey) {
            case ParticleAssetId.BOOST:
                this.ParticleAnimation(
                    ParticleAssetId.BOOST,
                    ParticleDirectionEnum.UP,
                    x,
                    y,
                    { depth },
                );
                break;
            case ParticleAssetId.DEBUFF:
                this.ParticleAnimation(
                    ParticleAssetId.DEBUFF,
                    ParticleDirectionEnum.DOWN,
                    x,
                    y,
                    { depth },
                );
                break;
            case ParticleAssetId.HEAL:
                this.ParticleAnimation(
                    ParticleAssetId.HEAL,
                    ParticleDirectionEnum.UP,
                    x,
                    y,
                    { depth },
                );
                break;
            case ParticleAssetId.SMOKE:
                this.ParticleAnimation(
                    ParticleAssetId.SMOKE,
                    ParticleDirectionEnum.UP,
                    x,
                    y,
                    {
                        speedY: { min: 20, max: 60 },
                        speedX: { min: -30, max: 30 },
                        scale: { start: 2, end: 8 },
                        lifespan: 2000,
                        frequency: 200,
                        depth,
                    },
                );
                break;
            // case ParticleAssetId.DUST:
            //     this.windAnimation(x, y);
            //     break;
        }
        return this;
    }

    async ParticleAnimation(
        particleSpriteKey: ParticleAssetId,
        direction: string,
        x: number,
        y: number,
        props: ParticleAnimationProps,
    ) {
        props.speedY ??= { min: 200, max: 350 };
        props.speedX ??= { min: -30, max: 30 };
        props.scale ??= { start: 2, end: 0.5 };
        props.lifespan ??= 750;
        props.frequency ??= 120;
        props.quantity ??= { min: 2, max: 0.5 };

        if (this.buffEmitter) {
            this.buffEmitter.stop();
            this.buffEmitter.destroy();
        }

        this.buffEmitter = this.scene.add.particles(
            x,
            direction === ParticleDirectionEnum.UP
                ? y
                : y - (128 * this.scene.scaleFactor) / 1.5,
            ParticleAsset.getAssetKey(particleSpriteKey),
            {
                speedY:
                    direction === ParticleDirectionEnum.UP
                        ? {
                              min: props.speedY.min * -1,
                              max: props.speedY.max * -1,
                          }
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

        this.buffEmitter.setDepth(props.depth);
        await new Promise<void>((resolve) => {
            this.buffEmitter.addEmitZone(
                new Phaser.GameObjects.Particles.Zones.RandomZone({
                    getRandomPoint: (point) => {
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

    async baseWindAnimation() {}

    private dustAnimation() {
        const buffEmitter = this.scene.add.particles(
            0,
            0,
            ParticleAsset.getAssetKey(ParticleAssetId.DUST),
            {
                speedX: { min: 40, max: 100 },
                speedY: { min: -15, max: 15 },
                accelerationY: { min: -20, max: 20 },
                scale: {
                    start: Phaser.Math.Between(0.8, 1.2),
                    end: Phaser.Math.Between(0.8, 1.2),
                },
                alpha: { start: 0.6, end: 0 },
                lifespan: { min: 3000, max: 6000 },
                frequency: 80,
                quantity: { min: 1, max: 5 },
                rotate: { min: -15, max: 15 },
                emitting: false,
            },
        );

        buffEmitter.addEmitZone(
            new Phaser.GameObjects.Particles.Zones.RandomZone({
                getRandomPoint: (point) => {
                    point.x = Phaser.Math.Between(0, window.innerWidth);
                    point.y = Phaser.Math.Between(0, window.innerHeight);
                    return point;
                },
            }),
        );

        buffEmitter.setDepth(
            Depth.getBackgroundElementDepth(BACKGROUND_LEVELS_OFFSET.WIND),
        );
        buffEmitter.start();
    }

    embersAnimation() {
        const buffEmitter = this.scene.add.particles(
            0,
            0,
            ParticleAsset.getAssetKey(ParticleAssetId.EMBER),
            {
                speedX: { min: -100, max: 100 },
                speedY: { min: -100, max: 100 },
                accelerationY: { min: -20, max: 20 },
                accelerationX: { min: -20, max: 20 },
                gravityX: Phaser.Math.Between(-2, 2),
                gravityY: Phaser.Math.Between(-2, 2),
                scale: {
                    start: Phaser.Math.Between(0.5, 1),
                    end: Phaser.Math.Between(0.5, 1),
                },
                alpha: { start: 0.6, end: 0 },
                lifespan: { min: 3000, max: 6000 },
                frequency: 150,
                quantity: { min: 1, max: 2 },
                rotate: { min: -45, max: 45 },
                emitting: false,
                angle: Phaser.Math.Between(50, 150),
            },
        );

        buffEmitter.addEmitZone(
            new Phaser.GameObjects.Particles.Zones.RandomZone({
                getRandomPoint: (point) => {
                    point.x = Phaser.Math.Between(0, window.innerWidth);
                    point.y = Phaser.Math.Between(0, window.innerHeight);
                    return point;
                },
            }),
        );

        buffEmitter.setDepth(
            Depth.getBackgroundElementDepth(BACKGROUND_LEVELS_OFFSET.WIND),
        );
        buffEmitter.start();
    }

    windAnimation(): void {
        this.dustAnimation();
        this.embersAnimation();
    }
}

