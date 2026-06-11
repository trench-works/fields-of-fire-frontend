import { ActionAnimationAsset, ActionAssetId } from "../../../../assets";
import { ParticleAssetId } from "../../../../assets/ParticleAsset";
import { AnimationUtils } from "../../../../core";
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
        switch (actionId) {
            case ActionAssetId.INTIMIDATION:
                {
                    const cell = this.scene.gridPositions[x][y];
                    this.loadActionAnimation(ActionAssetId.INTIMIDATION);
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
            sprite.setOrigin(0.5, 0.95);
            sprite.setScale(this.scene.scaleFactor / 1.5);
            sprite.play(animationName);

            setTimeout(() => {
                sprite.stop();
                sprite.destroy();
                resolve();
            }, AnimationUtils.getFullAnimationTime(frameTime));
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

