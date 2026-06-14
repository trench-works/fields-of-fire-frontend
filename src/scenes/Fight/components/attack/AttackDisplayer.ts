import {
    ActionAnimationAsset,
    ActionAssetId,
    SoundEffectAsset,
    SoundEffectAssetId,
} from "../../../../assets";
import { ParticleAssetId } from "../../../../assets/ParticleAsset";
import { AnimationUtils, SoundEffect } from "../../../../core";
import { Game } from "../../../../Model/Game";
import { FightScene } from "../../fight.scene";
import { GameAttackAnimation } from "../../repositories/player.socket";
import { GameStore } from "../../stores/GameStore";
import { FightSceneDisplayer } from "../FightSceneDisplayer";
import { ParticleDisplayer } from "../Particle/ParticleDisplayer";

export class AttackDisplayer extends FightSceneDisplayer {
    protected readonly particleDisplayer: ParticleDisplayer;

    constructor(scene: FightScene, gameStore: GameStore) {
        super(scene, gameStore);
        this.particleDisplayer = new ParticleDisplayer(scene);
    }

    async animate(
        {
            data: {
                actionId,
                target: { x, y },
            },
        }: GameAttackAnimation,
        newGame: Game,
    ): Promise<this> {
        const cell = this.scene.gridPositions[x][y];
        switch (actionId) {
            case ActionAssetId.SHOOT:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.SHOT),
                    ).play();
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.HURT),
                    ).play();
                }
                break;
            case ActionAssetId.AMPUTATE:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(
                            SoundEffectAssetId.AMPUTATE,
                        ),
                    ).play();
                }
                break;
            case ActionAssetId.INTIMIDATION:
                {
                    this.loadActionAnimation(ActionAssetId.INTIMIDATION);
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(
                            SoundEffectAssetId.INTIMIDATION,
                        ),
                    ).play();
                    await this.playActionAnimation(ActionAssetId.INTIMIDATION, {
                        x,
                        y,
                    });
                    await this.particleDisplayer.animate(
                        ParticleAssetId.DEBUFF,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                    );
                }
                break;
            case ActionAssetId.HEAL:
                {
                    await this.particleDisplayer.animate(
                        ParticleAssetId.HEAL,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                    );
                }
                break;
            case ActionAssetId.ARTILLERY_SUPPORT:
                {
                    this.loadActionAnimation(ActionAssetId.ARTILLERY_SUPPORT);
                    await this.playActionAnimation(
                        ActionAssetId.ARTILLERY_SUPPORT,
                        {
                            x,
                            y,
                        },
                        {
                            x: 0.5,
                            y: 0.7,
                        },
                    );
                    await this.particleDisplayer.animate(
                        ParticleAssetId.SMOKE,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                    );
                }
                break;
            case ActionAssetId.DOPAGE:
                {
                    await this.particleDisplayer.animate(
                        ParticleAssetId.BOOST,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                    );
                }
                break;
        }
        return this;
    }

    private loadActionAnimation(animationId: ActionAssetId) {
        const animationName = ActionAnimationAsset.getAssetKey(animationId);

        if (!this.scene.anims.get(animationName)) {
            const frames: Phaser.Types.Animations.AnimationFrame[] = [];
            const { frameTime } =
                ActionAnimationAsset.getFrameConfig(animationId);

            for (let i = 0; i < frameTime.length; i++) {
                frames.push({
                    key: animationName,
                    frame: i,
                    duration: frameTime[i],
                });
            }

            this.scene.anims.create({
                key: animationName,
                frames,
            });
        }
    }

    private async playActionAnimation(
        animationId: ActionAssetId,
        { x, y }: { x: number; y: number },
        offset: { x: number; y: number } = { x: 0.5, y: 0.95 },
    ) {
        return new Promise<void>((resolve) => {
            const animationName = ActionAnimationAsset.getAssetKey(animationId);
            const { frameTime } =
                ActionAnimationAsset.getFrameConfig(animationId);

            const cell = this.scene.gridPositions[x][y];
            const sprite = this.scene.physics.add.sprite(
                cell.pixelPosition.x,
                cell.pixelPosition.y,
                animationName,
            );

            sprite.setDepth(Math.max(x * 10, y * 10) + 1);
            sprite.setOrigin(offset.x, offset.y);
            sprite.setScale(this.scene.scaleFactor / 1.5);
            sprite.play(animationName);

            setTimeout(() => {
                sprite.stop();
                sprite.destroy();
                resolve();
            }, AnimationUtils.getFullAnimationTime(frameTime));
            setTimeout(
                () => {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.CANNON),
                    ).play();
                },
                AnimationUtils.getFullAnimationTime(frameTime.slice(0, 10)),
            );
        });
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
}

