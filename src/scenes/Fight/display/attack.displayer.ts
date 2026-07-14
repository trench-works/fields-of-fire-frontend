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

    async playBloodSplatter(
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
}

