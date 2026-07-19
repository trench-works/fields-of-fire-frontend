import { FightSceneDisplayer } from "./base/fight-scene.displayer";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/game.store";
import { CharacterAssetId, CharacterSpriteAsset } from "../../../assets";
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

    //Joue l'animation d'idle par défaut du personnage, ou une animation spécifique si une clé est fournie
    playAnimation(key?: string) {
        if (
            !this.sprite ||
            !key ||
            this.sprite.anims.currentAnim?.key === key
        ) {
            return;
        }

        this.sprite.play(key);
    }

    playIdleAnimation() {
        const entity = this.gameStore.getEntity(this.entityId);
        const assetKey = CharacterSpriteAsset.getAssetKey(entity.classId);
        this.playAnimation(`${assetKey}-idle-${this.direction}`);
    }

    async scope(time: number): Promise<void> {
        new Promise<void>((resolve) => {
            const entity = this.gameStore.getEntity(this.entityId);
            const assetKey = CharacterSpriteAsset.getAssetKey(entity.classId);
            this.playAnimation(`${assetKey}-scope-${this.direction}`);
            setTimeout(() => {
                this.playAnimation(`${assetKey}-idle-${this.direction}`);
                resolve();
            }, time);
        });
    }

    render(): this {
        const entity = this.gameStore.getEntity(this.entityId);
        const { x, y } = entity.position;
        const cell = this.gridStore.gridPositions[x][y];

        if (cell) {
            this.sprite = this.scene.physics.add.sprite(
                cell.pixelPosition.x,
                cell.pixelPosition.y,
                CharacterSpriteAsset.getAssetKey(entity.classId),
            );

            this.sprite.setDepth(
                Depth.getFromGridPosition({ x, y }, GRID_LEVELS_OFFSET.OBJECT),
            );
            if (entity.classId === CharacterAssetId.BARRICADE) {
                this.sprite.setOrigin(0.5, 0.75);
            } else {
                this.sprite.setOrigin(0.5, 0.95);
            }
            this.sprite.setScale(this.scene.scaleFactor / 1.5);

            this.createAnimations(entity.classId);
        }
        return this;
    }

    private createAnimations(classId: CharacterAssetId) {
        CharacterSpriteAsset.loadAssetAnimations(this.scene, classId);
        this.playIdleAnimation();
    }

    update(): this {
        if (!this.sprite) return this;

        const entity = this.gameStore.getEntity(this.entityId);

        const { x, y } = entity.position;
        const cell = this.gridStore.gridPositions[x][y];

        this.sprite.setPosition(cell.pixelPosition.x, cell.pixelPosition.y);
        this.sprite.setDepth(
            Depth.getFromGridPosition({ x, y }, GRID_LEVELS_OFFSET.OBJECT),
        );

        return this;
    }

    changeDirection(origin: Position, target: Position) {
        const startCell = this.gridStore.gridPositions[origin.x]?.[origin.y];
        const endCell = this.gridStore.gridPositions[target.x]?.[target.y];
        const horizontalDirection =
            startCell.pixelPosition.x - endCell.pixelPosition.x < 0 ? "R" : "L";
        const verticalDirection =
            startCell.pixelPosition.y - endCell.pixelPosition.y < 0 ? "D" : "U";

        this.direction = `${verticalDirection}${horizontalDirection}`;
        this.playIdleAnimation();
    }

    async slide(start: Position, end: Position, steps: number) {
        if (!this.sprite) return this;
        const startCell = this.gridStore.gridPositions[start.x]?.[start.y];
        const endCell = this.gridStore.gridPositions[end.x]?.[end.y];

        const moveLine = PositionUtils.subtract(
            endCell.pixelPosition,
            startCell.pixelPosition,
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

    setPosition({ x, y }: Position): this {
        if (!this.sprite) return this;

        const cell = this.gridStore.gridPositions[x]?.[y];

        this.sprite.setPosition(cell.pixelPosition.x, cell.pixelPosition.y);
        this.sprite.setDepth(
            Depth.getFromGridPosition({ x, y }, GRID_LEVELS_OFFSET.OBJECT),
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

