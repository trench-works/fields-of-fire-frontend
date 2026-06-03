import { Action } from "../../../../Model/Action";
import { FightSceneDisplayer } from "../FightSceneDisplayer";
import { FightScene } from "../../fight.scene";
import { ClassStore } from "../../stores/ClassStore";
import { GameStore } from "../../stores/GameStore";
import { CharacterSpriteAsset } from "../../../../assets";

export class Character extends FightSceneDisplayer {
    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly classStore: ClassStore,
        private readonly entityId: string,
    ) {
        super(scene, gameStore);
    }

    preRender(): this {
        return this;
    }

    protected sprite: Phaser.GameObjects.Sprite | undefined;

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

            this.sprite.setDepth(5);
            this.sprite.setOrigin(0.5, 0.95);
            this.sprite.setScale(this.scene.scaleFactor / 1.5);

            this.sprite.setInteractive();
            this.sprite.on("pointerdown", () => {
                if (!this.scene.actionManager.currentAction) {
                    this.scene.events.emit("characterClicked", this.entityId);
                }
            });

            this.createAnimations(entity.classId);
        }
        return this;
    }

    private createAnimations(classId: string) {
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

        return this;
    }

    public enableClick() {
        this.sprite?.setInteractive();
    }

    public disableClick() {
        this.sprite?.disableInteractive();
    }

    public showPreview(show: boolean, action?: Action) {
        if (!this.sprite) return;

        this.sprite?.off("pointerover");
        this.sprite?.off("pointerout");

        const entity = this.gameStore.getEntity(this.entityId);

        const title = `❤️ ${entity.stats.life} PV`;

        if (!show) {
            this.scene.tooltip.attachTo(
                this.sprite!,
                this.classStore.getClass(entity.classId).name,
                title,
                undefined,
                this.sprite!,
            );
        } else {
            const estimatedDamage = action
                ? `Dégâts estimés : 12²` // ← ici tu peux calculer les dégâts estimés en fonction de l'action et des stats du personnage
                : "Aucune action sélectionnée";

            this.scene.tooltip.attachTo(
                this.sprite!,
                estimatedDamage, // ← description = dégâts estimés
                title,
                undefined,
                this.sprite!,
            );
        }
    }
}

