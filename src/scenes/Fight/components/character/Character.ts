import { FightSceneDisplayer } from "../FightSceneDisplayer";
import { FightScene } from "../../fight.scene";
import { GameStore } from "../../stores/GameStore";
import { CharacterAssetId, CharacterSpriteAsset } from "../../../../assets";
import { GameMoveAnimation } from "../../repositories/player.socket";
import { Game } from "../../../../Model/Game";
import { Position } from "../../../../core";
import { PositionUtils } from "../../../../core/Utils/Sizing";

export class Character extends FightSceneDisplayer {
    constructor(
        scene: FightScene,
        gameStore: GameStore,
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
    playAnimation(key: string) {
        if (!this.sprite) return;
        if (this.sprite.anims.currentAnim?.key === key) return;
        this.sprite.play(key);
    }

    render(): this {
        const entity = this.gameStore.getEntity(this.entityId);
        const { x, y } = entity.position;
        const cell = this.scene.gridPositions[x][y];

        if (cell) {
            this.sprite = this.scene.physics.add.sprite(
                cell.pixelPosition.x,
                cell.pixelPosition.y,
                CharacterSpriteAsset.getAssetKey(entity.classId),
            );

            this.sprite.setDepth(Math.max(x * 10, y * 10) + 1);
            this.sprite.setOrigin(0.5, 0.95);
            this.sprite.setScale(this.scene.scaleFactor / 1.5);

            this.createAnimations(entity.classId);
        }
        return this;
    }

    private createAnimations(classId: CharacterAssetId) {
        const assetKey = CharacterSpriteAsset.getAssetKey(classId);
        if (!this.scene.anims.exists(`${assetKey}-idle-DR`)) {
            this.loadIdleAnimation(assetKey, `${assetKey}-idle-DR`, 0, 1);
        }
        if (!this.scene.anims.exists(`${assetKey}-idle-DL`)) {
            this.loadIdleAnimation(assetKey, `${assetKey}-idle-DL`, 2, 3);
        }
        if (!this.scene.anims.exists(`${assetKey}-idle-UL`)) {
            this.loadIdleAnimation(assetKey, `${assetKey}-idle-UL`, 4, 5);
        }
        if (!this.scene.anims.exists(`${assetKey}-idle-UR`)) {
            this.loadIdleAnimation(assetKey, `${assetKey}-idle-UR`, 6, 7);
        }
        this.playAnimation(`${assetKey}-idle-DR`); // default animation direction
    }

    private loadIdleAnimation(
        assetKey: string,
        animationName: string,
        startFrame: number,
        endFrame: number,
    ) {
        this.scene.anims.create({
            key: `${animationName}`,
            frames: this.scene.anims.generateFrameNumbers(assetKey, {
                start: startFrame,
                end: endFrame,
            }),
            frameRate: 2,
            repeat: -1,
        });
    }

    update(): this {
        if (!this.sprite) return this;

        const entity = this.gameStore.getEntity(this.entityId);

        const { x, y } = entity.position;
        const cell = this.scene.gridPositions[x][y];

        this.sprite.setPosition(cell.pixelPosition.x, cell.pixelPosition.y);
        this.sprite.setDepth(Math.max(x, y) * 10);

        return this;
    }

    changeDirection(horizontal: "R" | "L", vertical: "D" | "U") {
        const entity = this.gameStore.getEntity(this.entityId);
        const assetKey = CharacterSpriteAsset.getAssetKey(entity.classId);
        this.playAnimation(`${assetKey}-idle-${vertical}${horizontal}`);
    }

    async slide(start: Position, end: Position, steps: number) {
        if (!this.sprite) return this;
        const startCell = this.scene.gridPositions[start.x]?.[start.y];
        const endCell = this.scene.gridPositions[end.x]?.[end.y];

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
            await new Promise<void>((resolve) => setTimeout(resolve, 0.5));
        }

        this.setPosition(end);
    }

    setPosition({ x, y }: Position): this {
        if (!this.sprite) return this;

        const cell = this.scene.gridPositions[x]?.[y];

        this.sprite.setPosition(cell.pixelPosition.x, cell.pixelPosition.y);
        this.sprite.setDepth((x + y) * 10 + 2);
        return this;
    }

    async animate(animation: GameMoveAnimation, newGame: Game): Promise<this> {
        for (let i = 1; i < animation.data.path.length; i++) {
            //const precedentPosition = animation.data.path[i - 1];
            const newPosition = animation.data.path[i];
            this.setPosition(newPosition);
            await new Promise<void>((resolve) => setTimeout(resolve, 100));
            //await this.slide(precedentPosition, newPosition, 150);
        }
        return this;
    }
}

