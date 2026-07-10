import {
    ActionAnimationAsset,
    ActionAssetId,
    MiscAnimationAsset,
    MiscAnimationId,
    SoundEffectAsset,
    SoundEffectAssetId,
} from "../../../assets";
import { ParticleAssetId } from "../../../assets/ParticleAsset";
import {
    Depth,
    DirectionUtils,
    DisplayAnimation,
    GRID_LEVELS_OFFSET,
    Position,
    SoundEffect,
    Timeout,
} from "../../../core";
import { Game } from "../../../Model/Game";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/game.store";
import { CharactersDisplayer } from "./characters.displayer";
import { FightSceneDisplayer } from "./base/fight-scene.displayer";
import { ParticleDisplayer } from "./particles.displayer";
import { ToastDisplayer } from "./toast.displayer";
import { GameAttackAnimation } from "../repositories/game.repository";
import { GridStore } from "../stores/grid.store";

export class AttackDisplayer extends FightSceneDisplayer {
    protected readonly particleDisplayer: ParticleDisplayer;

    protected readonly toaster: ToastDisplayer;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly character: CharactersDisplayer,
        private readonly gridStore: GridStore,
    ) {
        super(scene, gameStore);
        this.particleDisplayer = new ParticleDisplayer(scene);
        this.toaster = new ToastDisplayer(scene, gridStore);
    }

    async animate(animation: GameAttackAnimation): Promise<this> {
        const {
            data: { entityId, actionId, target, origin, hits },
        } = animation;
        const { x, y } = target;
        const cell = this.gridStore.gridPositions[x][y];
        switch (actionId) {
            case ActionAssetId.SHOOT:
                {
                    this.character.changeDirection(target, entityId);
                    this.character.scope(entityId, 700);
                    await Timeout(200);
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.SHOT),
                    ).play();
                    this.playDamages(this.gameStore.game, hits, origin, target);
                    this.scene.cameras.main.shake(200, 0.001);
                    this.toaster.attackToast(animation);
                    await this.toaster.attackToast(animation);
                    await Timeout(200);
                }
                break;
            case ActionAssetId.BAYONET:
                {
                    this.character.changeDirection(target, entityId);
                    this.character.scope(entityId, 700);
                    await Timeout(200);
                    this.playDamages(this.gameStore.game, hits, origin, target);
                    this.scene.cameras.main.shake(200, 0.001);
                    this.toaster.attackToast(animation);
                    await this.toaster.attackToast(animation);
                    await Timeout(200);
                }
                break;
            case ActionAssetId.AMPUTATE:
                {
                    this.character.changeDirection(target, entityId);
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(
                            SoundEffectAssetId.AMPUTATE,
                        ),
                    ).play();
                    this.toaster.attackToast(animation);
                    await this.playDamages(
                        this.gameStore.game,
                        hits,
                        origin,
                        target,
                    );
                    await this.toaster.attackToast(animation);
                }
                break;
            case ActionAssetId.INTIMIDATION:
                {
                    this.character.changeDirection(target, entityId);
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
                    await this.particleDisplayer.animate(
                        ParticleAssetId.DEBUFF,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                        Depth.getFromGridPosition(
                            cell.gridPosition,
                            GRID_LEVELS_OFFSET.ANIMATION_4,
                        ),
                    );
                }
                break;
            case ActionAssetId.HEAL:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.DOPAGE),
                    ).play();
                    this.character.changeDirection(target, entityId);
                    await this.particleDisplayer.animate(
                        ParticleAssetId.HEAL,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                        Depth.getFromGridPosition(
                            cell.gridPosition,
                            GRID_LEVELS_OFFSET.ANIMATION_4,
                        ),
                    );
                    await Timeout(500);
                }
                break;
            case ActionAssetId.ARTILLERY_SUPPORT:
                {
                    this.character.changeDirection(target, entityId);
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
                    await this.toaster.attackToast(animation);
                    this.playDamages(this.gameStore.game, hits, origin, target); //TODO mage particle blood splatter
                    await this.particleDisplayer.animate(
                        ParticleAssetId.SMOKE,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                        Depth.getFromGridPosition(
                            cell.gridPosition,
                            GRID_LEVELS_OFFSET.ANIMATION_4,
                        ),
                    );
                    this.toaster.attackToast(animation);
                }
                break;
            case ActionAssetId.DOPAGE:
                {
                    this.character.changeDirection(target, entityId);
                    await this.particleDisplayer.animate(
                        ParticleAssetId.BOOST,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                        Depth.getFromGridPosition(
                            cell.gridPosition,
                            GRID_LEVELS_OFFSET.ANIMATION_4,
                        ),
                    );
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.DOPAGE),
                    ).play();
                    await Timeout(1000);
                }
                break;
            case ActionAssetId.FIGHTING_DRUG:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.DOPAGE),
                    ).play();
                    this.character.changeDirection(target, entityId);
                    await this.particleDisplayer.animate(
                        ParticleAssetId.BOOST,
                        cell.pixelPosition.x,
                        cell.pixelPosition.y,
                        Depth.getFromGridPosition(
                            cell.gridPosition,
                            GRID_LEVELS_OFFSET.ANIMATION_4,
                        ),
                    );
                    await Timeout(1000);
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
                        Depth.getFromGridPosition(
                            cell.gridPosition,
                            GRID_LEVELS_OFFSET.ANIMATION_4,
                        ),
                    );
                    await Timeout(1000);
                }
                break;
            case ActionAssetId.SABER:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.SABER),
                    ).play();
                    this.playDamages(this.gameStore.game, hits, origin, target);
                    await this.toaster.attackToast(animation);
                }
                break;
            case ActionAssetId.SHIELD_RUSH:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(
                            SoundEffectAssetId.SHIELD_IMPACT,
                        ),
                    ).play();
                    this.playDamages(this.gameStore.game, hits, origin, target);
                    await this.toaster.attackToast(animation);
                }
                break;
            case ActionAssetId.BARRICADE:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.HAMMER),
                    ).play();
                    await Timeout(1000);
                }
                break;
            case ActionAssetId.BREAK:
                {
                    //this.scene.character.changeDirection(target, entityId);
                    this.character.scope(entityId, 700);
                    await Timeout(350);
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(
                            SoundEffectAssetId.BATTLE_AXE,
                        ),
                    ).play();
                    this.playDamages(this.gameStore.game, hits, origin, target);
                    await this.toaster.attackToast(animation);
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
        const cell = this.gridStore.gridPositions[x][y];
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

    private async playDamages(
        game: Game,
        hits: Position[],
        origin: Position,
        target: Position,
    ) {
        await Promise.all(
            hits.map(async ({ x, y }) => {
                const cell = game.plateau[x][y];
                const entity = game.entities.find(
                    (entity) => entity.id === cell.entityId,
                );
                if (entity) {
                    if (entity.classId === "barricade") {
                        new SoundEffect(
                            this.scene,
                            SoundEffectAsset.getAssetKey(
                                SoundEffectAssetId.WOOD_CRACK,
                            ),
                        ).play();
                    } else {
                        new SoundEffect(
                            this.scene,
                            SoundEffectAsset.getAssetKey(
                                SoundEffectAssetId.HURT,
                            ),
                        ).play();
                        await this.playBloodSplatter({ x, y }, origin, target);
                    }
                }
            }),
        );
    }

    private async playBloodSplatter(
        { x, y }: Position,
        origin: Position,
        target: Position,
    ) {
        const hitCell = this.gridStore.gridPositions[x][y];
        let direction: number;
        if (target.x === x && target.y === y) {
            const originCell = this.gridStore.gridPositions[origin.x][origin.y];
            direction = DirectionUtils.getDirection(
                originCell.pixelPosition,
                hitCell.pixelPosition,
            );
        } else {
            const targetCell = this.gridStore.gridPositions[target.x][target.y];
            direction = DirectionUtils.getDirection(
                targetCell.pixelPosition,
                hitCell.pixelPosition,
            );
        }
        const tile = this.gameStore.game.plateau[x][y];
        if (tile.entityId) {
            return new DisplayAnimation(
                this.scene,

                MiscAnimationAsset.getAssetKey(MiscAnimationId.BLOOD_SPLATTER),
                MiscAnimationAsset.getFrameConfig(
                    MiscAnimationId.BLOOD_SPLATTER,
                ),
            ).animate(
                {
                    x: hitCell.pixelPosition.x,
                    y: hitCell.pixelPosition.y - 40 * this.scene.scaleFactor,
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

