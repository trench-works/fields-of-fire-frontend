import {
    ActionAnimationAsset,
    ActionAssetId,
    MiscAnimationAsset,
    MiscAnimationId,
    SoundEffectAsset,
    SoundEffectAssetId,
} from "../../../assets";
import {
    Depth,
    DirectionUtils,
    DisplayAnimation,
    GRID_LEVELS_OFFSET,
    Position,
    SoundEffect,
} from "../../../core";
import { Game } from "../../../Model/Game";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/game.store";
import { GridStore } from "../stores/grid.store";

export class AttackDisplayer {
    constructor(
        private readonly scene: FightScene,
        private readonly gameStore: GameStore,
        private readonly gridStore: GridStore,
    ) {}

    async playActionAnimation(
        animationId: ActionAssetId,
        pos: Position,
        origin: Position = { x: 0.5, y: 0.95 },
        depth: number = 1,
    ) {
        const cell = this.gridStore.get(pos);
        if (!cell) {
            return;
        }
        return await new DisplayAnimation(
            this.scene,
            ActionAnimationAsset.getAssetKey(animationId),
            ActionAnimationAsset.getFrameConfig(animationId),
        ).animate(
            {
                x: cell.position.x,
                y: cell.position.y,
            },
            {
                depth: Depth.getFromGridPosition(pos) + depth,
                scale: this.scene.scaleFactor / 1.5,
                origin,
            },
        );
    }

    async playDamages(
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

    async playBloodSplatter(hit: Position, origin: Position, target: Position) {
        const hitCell = this.gridStore.get(hit);
        if (!hitCell) {
            return;
        }
        let direction: number;
        if (target.x === hit.x && target.y === hit.y) {
            const originCell = this.gridStore.get(origin);
            if (!originCell) {
                return;
            }
            direction = DirectionUtils.getDirection(
                originCell.position,
                hitCell.position,
            );
        } else {
            const targetCell = this.gridStore.get(target);
            if (!targetCell) {
                return;
            }
            direction = DirectionUtils.getDirection(
                targetCell.position,
                hitCell.position,
            );
        }
        const tile = this.gameStore.getCell(hit);
        if (tile?.entityId) {
            return new DisplayAnimation(
                this.scene,

                MiscAnimationAsset.getAssetKey(MiscAnimationId.BLOOD_SPLATTER),
                MiscAnimationAsset.getFrameConfig(
                    MiscAnimationId.BLOOD_SPLATTER,
                ),
            ).animate(
                {
                    x: hitCell.position.x,
                    y: hitCell.position.y - 40 * this.scene.scaleFactor,
                },
                {
                    depth: Depth.getFromGridPosition(
                        hit,
                        GRID_LEVELS_OFFSET.ANIMATION_2,
                    ),
                    scale: 0.2 * this.scene.scaleFactor,
                    origin: { x: 0.5, y: 0.5 },
                    direction: -direction - 90 - 10,
                },
            );
        }
    }
}

