import { FightSceneDisplayer } from "./base/fight-scene.displayer";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/game.store";
import {
    CharacterAnimation,
    CharacterAssetId,
    CharacterSpriteAsset,
} from "../../../assets";
import { Depth, GRID_LEVELS_OFFSET, Position, Timeout } from "../../../core";
import { PositionUtils } from "../../../core/Utils/Sizing";
import { GridStore } from "../stores/grid.store";
import { GameMoveAnimation } from "../repositories/game.repository";

export class EntityDisplayer extends FightSceneDisplayer {
    protected direction: "UR" | "UL" | "DR" | "DL" = "DR";

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly gridStore: GridStore,
        public readonly entityId: string,
    ) {
        super(scene, gameStore);
    }

    preRender(): this {
        return this;
    }

    protected sprite: Phaser.GameObjects.Sprite | undefined;

    destroy(): this {
        this.sprite?.destroy();
        return this;
    }

    private playAnimation(
        classId: CharacterAssetId,
        animation: CharacterAnimation,
    ) {
        const assetKey = CharacterSpriteAsset.getAssetKey(classId);
        const key = `${assetKey}-${animation}-${this.direction}`;
        if (!this.sprite || this.sprite.anims.currentAnim?.key === key) {
            return;
        }

        this.sprite.play(key);
    }

    playIdleAnimation() {
        const entity = this.gameStore.getEntity(this.entityId);
        this.playAnimation(entity.classId, CharacterAnimation.IDLE);
    }

    async scope(time: number): Promise<void> {
        new Promise<void>((resolve) => {
            const entity = this.gameStore.getEntity(this.entityId);
            this.playAnimation(entity.classId, CharacterAnimation.SCOPE);
            setTimeout(() => {
                this.playAnimation(entity.classId, CharacterAnimation.IDLE);
                resolve();
            }, time);
        });
    }

    render(): this {
        const entity = this.gameStore.getEntity(this.entityId);
        const cell = this.gridStore.get(entity.position);

        if (cell) {
            this.sprite = this.scene.physics.add.sprite(
                cell.position.x,
                cell.position.y - cell.height / 4,
                CharacterSpriteAsset.getAssetKey(entity.classId),
            );

            this.sprite.setDepth(
                Depth.getFromGridPosition(
                    entity.position,
                    GRID_LEVELS_OFFSET.OBJECT,
                ),
            );
            if (entity.classId === CharacterAssetId.BARRICADE) {
                this.sprite.setOrigin(0.5, 0.75);
            } else {
                this.sprite.setOrigin(0.5, 0.95);
            }
            this.sprite.setScale(cell.scale / 1.5);

            this.createAnimations(entity.classId);
        }
        return this;
    }

    scale() {
        const entity = this.gameStore.getEntity(this.entityId);
        const cell = this.gridStore.get(entity.position);
        if (cell) {
            this.sprite?.setPosition(
                cell.position.x,
                cell.position.y - cell.height / 4,
            );
            this.sprite?.setScale(cell.scale / 1.5);
        }
    }

    private createAnimations(classId: CharacterAssetId) {
        CharacterSpriteAsset.loadAssetAnimations(this.scene, classId);
        this.playIdleAnimation();
    }

    update(): this {
        if (!this.sprite) return this;

        const entity = this.gameStore.getEntity(this.entityId);

        const cell = this.gridStore.get(entity.position);
        if (!cell) {
            return this;
        }
        this.sprite.setPosition(
            cell.position.x,
            cell.position.y - cell.height / 4,
        );
        this.sprite.setDepth(
            Depth.getFromGridPosition(
                entity.position,
                GRID_LEVELS_OFFSET.OBJECT,
            ),
        );

        return this;
    }

    changeDirection(origin: Position, target: Position) {
        const startCell = this.gridStore.get(origin);
        const endCell = this.gridStore.get(target);
        if (!startCell || !endCell) {
            return;
        }
        const horizontalDirection =
            startCell.position.x - endCell.position.x < 0 ? "R" : "L";
        const verticalDirection =
            startCell.position.y - endCell.position.y < 0 ? "D" : "U";

        this.direction = `${verticalDirection}${horizontalDirection}`;
        this.playIdleAnimation();
    }

    async slide(start: Position, end: Position, steps: number) {
        if (!this.sprite) return this;
        const startCell = this.gridStore.get(start);
        const endCell = this.gridStore.get(end);
        if (!startCell || !endCell) {
            return;
        }

        const moveLine = PositionUtils.subtract(
            endCell.position,
            startCell.position,
        );
        const moveStep = PositionUtils.divide(moveLine, steps);
        for (let i = 0; i < steps; i++) {
            this.sprite.setPosition(
                this.sprite.x + moveStep.x,
                this.sprite.y + moveStep.y,
            );
            await Timeout(0.5);
        }

        this.setPosition(end);
    }

    setPosition(pos: Position): this {
        if (!this.sprite) return this;

        const cell = this.gridStore.get(pos);
        if (!cell) {
            return this;
        }

        this.sprite.setPosition(
            cell.position.x,
            cell.position.y - cell.height / 4,
        );
        this.sprite.setDepth(
            Depth.getFromGridPosition(pos, GRID_LEVELS_OFFSET.OBJECT),
        );
        return this;
    }

    async animate(animation: GameMoveAnimation): Promise<this> {
        for (let i = 1; i < animation.data.path.length; i++) {
            const precedentPosition = animation.data.path[i - 1];
            const newPosition = animation.data.path[i];
            this.changeDirection(precedentPosition, newPosition);
            this.setPosition(newPosition);
            await Timeout(100);
            //await this.slide(precedentPosition, newPosition, 150);
        }
        return this;
    }
}

