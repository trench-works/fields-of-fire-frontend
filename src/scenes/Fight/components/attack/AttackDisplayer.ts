import {
    ActionAnimationAsset,
    ActionAssetId,
    MiscAnimationAsset,
    MiscAnimationId,
    SoundEffectAsset,
    SoundEffectAssetId,
} from "../../../../assets";
import { ParticleAssetId } from "../../../../assets/ParticleAsset";
import { DisplayAnimation, Position, SoundEffect } from "../../../../core";
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
        const tile = this.gameStore.game.plateau[x][y];
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
                    this.scene.cameras.main.shake(200, 0.001);
                    if (tile.entityId) {
                        await this.playBloodSplatter({ x, y });
                    }
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
                    if (tile.entityId) {
                        await this.playBloodSplatter({ x, y });
                    }
                }
                break;
            case ActionAssetId.INTIMIDATION:
                {
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
                        -1,
                    );

                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.CANNON),
                    ).play();
                    this.scene.cameras.main.shake(200, 0.005);
                    if (tile.entityId) {
                        //TODO: handle multiple victims
                        await this.playBloodSplatter({ x, y }); //TODO: make particle blood splatter
                    }
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

    private async playActionAnimation(
        animationId: ActionAssetId,
        { x, y }: Position,
        offset: Position = { x: 0.5, y: 0.95 },
        depth: number = 1,
    ) {
        const cell = this.scene.gridPositions[x][y];
        return await new DisplayAnimation(
            this.scene,
            {
                x: cell.pixelPosition.x,
                y: cell.pixelPosition.y,
                depth: Math.max(x * 10, y * 10) + depth,
                scale: this.scene.scaleFactor / 1.5,
                offset,
            },
            ActionAnimationAsset.getAssetKey(animationId),
            ActionAnimationAsset.getFrameConfig(animationId),
        ).animate();
    }

    private async playBloodSplatter(
        { x, y }: Position,
        offset: Position = { x: 0.5, y: 0.95 },
    ) {
        const cell = this.scene.gridPositions[x][y];
        return await new DisplayAnimation(
            this.scene,
            {
                x: cell.pixelPosition.x,
                y: cell.pixelPosition.y,
                depth: Math.max(x * 10, y * 10) + 1,
                scale: 0.2 * this.scene.scaleFactor,
                offset,
            },
            MiscAnimationAsset.getAssetKey(MiscAnimationId.BLOOD_SPLATTER),
            MiscAnimationAsset.getFrameConfig(MiscAnimationId.BLOOD_SPLATTER),
        ).animate();
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

