import {
    ActionAnimationAsset,
    ActionAssetId,
    MiscAnimationAsset,
    MiscAnimationId,
    SoundEffectAsset,
    SoundEffectAssetId,
} from "../../../../assets";
import { ParticleAssetId } from "../../../../assets/ParticleAsset";
import {
    Depth,
    DirectionUtils,
    DisplayAnimation,
    GRID_LEVELS_OFFSET,
    Position,
    SoundEffect,
    Timeout,
} from "../../../../core";
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
        animation: GameAttackAnimation,
        newGame: Game,
    ): Promise<this> {
        const {
            data: { entityId, actionId, target, origin, hits },
        } = animation;
        const { x, y } = target;
        const cell = this.scene.gridPositions[x][y];
        switch (actionId) {
            case ActionAssetId.SHOOT:
                {
                    this.scene.character.changeDirection(target, entityId);
                    this.scene.character.scope(entityId, 700);
                    await Timeout(200);
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.SHOT),
                    ).play();
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.HURT),
                    ).play();
                    this.scene.cameras.main.shake(200, 0.001);
                    this.scene.toaster.attackToast(animation);
                    await this.playBloodSplatter(hits, origin, target);
                }
                break;
            case ActionAssetId.BAYONET:
                {
                    this.scene.character.changeDirection(target, entityId);
                    this.scene.character.scope(entityId, 700);
                    await Timeout(200);
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.HURT),
                    ).play();
                    this.scene.cameras.main.shake(200, 0.001);
                    this.scene.toaster.attackToast(animation);
                    await this.playBloodSplatter(hits, origin, target);
                }
                break;
            case ActionAssetId.AMPUTATE:
                {
                    this.scene.character.changeDirection(target, entityId);
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(
                            SoundEffectAssetId.AMPUTATE,
                        ),
                    ).play();
                    this.scene.toaster.attackToast(animation);
                    await this.playBloodSplatter(hits, origin, target);
                }
                break;
            case ActionAssetId.INTIMIDATION:
                {
                    this.scene.character.changeDirection(target, entityId);
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(
                            SoundEffectAssetId.INTIMIDATION,
                        ),
                    ).play();
                    await this.playActionAnimation(
                        ActionAssetId.INTIMIDATION,
                        target,
                    );
                    this.scene.toaster.attackToast(animation);
                    await this.particleDisplayer.animate(
                        ParticleAssetId.DEBUFF,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                    );
                }
                break;
            case ActionAssetId.HEAL:
                {
                    this.scene.character.changeDirection(target, entityId);
                    this.scene.toaster.attackToast(animation);
                    await this.particleDisplayer.animate(
                        ParticleAssetId.HEAL,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                    );
                }
                break;
            case ActionAssetId.ARTILLERY_SUPPORT:
                {
                    this.scene.character.changeDirection(target, entityId);
                    await this.playActionAnimation(
                        ActionAssetId.ARTILLERY_SUPPORT,
                        target,
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
                    this.scene.toaster.attackToast(animation);
                    await this.playBloodSplatter(hits, origin, target); //TODO: make particle blood splatter
                    await this.particleDisplayer.animate(
                        ParticleAssetId.SMOKE,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                    );
                }
                break;
            case ActionAssetId.DOPAGE:
                {
                    this.scene.character.changeDirection(target, entityId);
                    this.scene.toaster.attackToast(animation);
                    await this.particleDisplayer.animate(
                        ParticleAssetId.BOOST,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                    );
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.DOPAGE),
                    ).play();
                }
                break;
            case ActionAssetId.FIGHTING_DRUG:
                {
                    this.scene.character.changeDirection(target, entityId);
                    this.scene.toaster.attackToast(animation);
                    await this.particleDisplayer.animate(
                        ParticleAssetId.BOOST,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                    );
                }
                break;
            case ActionAssetId.CHARGE:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.CHARGE),
                    ).play();
                    await this.particleDisplayer.animate(
                        ParticleAssetId.BOOST,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                    );
                }
                break;
            case ActionAssetId.SABER:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.SABER),
                    ).play();
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.HURT),
                    ).play();
                    await this.playBloodSplatter(hits, origin, target);
                }
                break;
        }
        return this;
    }

    private async playActionAnimation(
        animationId: ActionAssetId,
        { x, y }: Position,
        origin: Position = { x: 0.5, y: 0.95 },
        depth: number = 1,
    ) {
        const cell = this.scene.gridPositions[x][y];
        return await new DisplayAnimation(
            this.scene,
            ActionAnimationAsset.getAssetKey(animationId),
            ActionAnimationAsset.getFrameConfig(animationId),
        ).animate(
            {
                x: cell.pixelPosition.x,
                y: cell.pixelPosition.y,
            },
            {
                depth: Depth.getFromGridPosition({ x, y }) + depth,
                scale: this.scene.scaleFactor / 1.5,
                origin,
            },
        );
    }

    private async playBloodSplatter(
        hits: Position[],
        origin: Position,
        target: Position,
    ) {
        await Promise.all(
            hits.map(({ x, y }) => {
                const hitCell = this.scene.gridPositions[x][y];
                let direction: number;
                if (target.x === x && target.y === y) {
                    const originCell =
                        this.scene.gridPositions[origin.x][origin.y];
                    direction = DirectionUtils.getDirection(
                        originCell.pixelPosition,
                        hitCell.pixelPosition,
                    );
                } else {
                    const targetCell =
                        this.scene.gridPositions[target.x][target.y];
                    direction = DirectionUtils.getDirection(
                        targetCell.pixelPosition,
                        hitCell.pixelPosition,
                    );
                }
                const tile = this.gameStore.game.plateau[x][y];
                if (tile.entityId) {
                    return new DisplayAnimation(
                        this.scene,

                        MiscAnimationAsset.getAssetKey(
                            MiscAnimationId.BLOOD_SPLATTER,
                        ),
                        MiscAnimationAsset.getFrameConfig(
                            MiscAnimationId.BLOOD_SPLATTER,
                        ),
                    ).animate(
                        {
                            x: hitCell.pixelPosition.x,
                            y:
                                hitCell.pixelPosition.y -
                                40 * this.scene.scaleFactor,
                        },
                        {
                            depth: Depth.getFromGridPosition(
                                { x, y },
                                GRID_LEVELS_OFFSET.ANIMATION_2,
                            ),
                            scale: 0.2 * this.scene.scaleFactor,
                            origin: { x: 0.5, y: 0.5 },
                            direction: -direction - 90 - 10,
                        },
                    );
                }
            }),
        );
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

