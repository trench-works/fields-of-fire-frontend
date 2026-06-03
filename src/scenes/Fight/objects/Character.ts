import { GameObject, PositionUtils } from "../../../core";
import { Action } from "../../../Model/Action";
import { CharacterClass } from "../../../Model/CharacterClass";
import { Entity } from "../../../Model/Entity";
import {
    Cell,
    FightScene,
    RenderResult,
    SceneRenderConfig,
} from "../fight.scene";

export type CharactersProps = {
    charClass: CharacterClass;
    entity: Entity;
};

export class Character extends GameObject {
    protected sprite: Phaser.GameObjects.Sprite | undefined;

    public charClass: CharacterClass;
    public entity: Entity;

    constructor(scene: Phaser.Scene, { charClass, entity }: CharactersProps) {
        super({ scene });

        this.charClass = charClass;
        this.entity = entity;
    }

    get stats() {
        const stats = {
            ...this.entity.stats,
        };

        this.entity.effects?.forEach((effect) => {
            stats.life += effect.statModification.life;
            stats.precision += effect.statModification.precision;
            stats.strength += effect.statModification.precision;
            stats.armor += effect.statModification.armor;
            stats.initiative += effect.statModification.initiative;
            stats.energy += effect.statModification.energy;
            stats.mouvement += effect.statModification.mouvement;
        });

        return stats;
    }

    preload(loader: Phaser.Loader.LoaderPlugin) {
        if (this.charClass.spriteKey) {
            loader.spritesheet(
                this.charClass.spriteKey,
                `assets/Sprites/${this.charClass.spriteKey}.png`,
                { frameWidth: 96, frameHeight: 128 },
            );
            loader.image(
                this.charClass.iconImageKey,
                `assets/${this.charClass.iconImageKey}.png`, //TODO: add character asset manager
            );

            this.charClass.actionList.forEach((action) => {
                if (action.id) {
                    loader.image(action.id, `assets/action/${action.id}.png`); //TODO: add action asset manager
                    console.log(`assets/action/${action.id}.png`);
                }
            });
        }
    }

    //Spawne le personnage sur la scène, en créant son sprite et en le positionnant correctement sur la grille
    spawn(scene: Phaser.Scene, scaleFactor: number, gridPositions: Cell[][]) {
        this.scene = scene;

        const { x, y } = this.entity.position;
        const cell = gridPositions[x][y];

        if (cell) {
            this.sprite = scene.physics.add.sprite(
                cell.pixelPosition.x,
                cell.pixelPosition.y,
                this.charClass.spriteKey,
            );

            this.sprite.setDepth(5);
            this.sprite.setOrigin(0.5, 0.95);
            this.sprite.setScale(scaleFactor / 1.5);

            this.sprite.setInteractive();
            this.sprite.on("pointerdown", () => {
                if (!(scene as FightScene).actionManager.currentAction) {
                    scene.events.emit("characterClicked", this);
                }
            });

            this.createAnimations(this.charClass.spriteKey);
        }
    }

    //Joue l'animation d'idle par défaut du personnage, ou une animation spécifique si une clé est fournie
    playAnimation(key: string = this.charClass.spriteKey + "-idle-DR") {
        if (!this.sprite) return;
        if (this.sprite.anims.currentAnim?.key === key) return;
        this.sprite.play(key);
    }

    createAnimations(spriteKey: string) {
        if (!this.scene.anims.exists(`${spriteKey}-idle-DL`)) {
            this.loadIdleAnimation(`${spriteKey}-idle-DL`, 2, 3);
        }
        if (!this.scene.anims.exists(`${spriteKey}-idle-DR`)) {
            this.loadIdleAnimation(`${spriteKey}-idle-DR`, 0, 1);
        }
        if (!this.scene.anims.exists(`${spriteKey}-idle-UL`)) {
            this.loadIdleAnimation(`${spriteKey}-idle-UL`, 4, 5);
        }
        if (!this.scene.anims.exists(`${spriteKey}-idle-UR`)) {
            this.loadIdleAnimation(`${spriteKey}-idle-UR`, 6, 7);
        }
        this.playAnimation();
    }

    //Créé une animation d'idle à partir d'une spritesheet, en précisant les frames de début et de fin de l'animation
    loadIdleAnimation(
        animationName: string,
        startFrame: number,
        endFrame: number,
        frameRate: number = 2,
        repeat: number = -1,
    ) {
        this.scene.anims.create({
            key: `${animationName}`,
            frames: this.scene.anims.generateFrameNumbers(
                this.charClass.spriteKey,
                {
                    start: startFrame,
                    end: endFrame,
                },
            ),
            frameRate: frameRate,
            repeat: repeat,
        });
    }
    render(renderConfig: SceneRenderConfig): RenderResult {
        const renderPosition = PositionUtils.getPixelsFromPosition(
            this.entity.position,
            renderConfig,
        );
        return {
            position: renderPosition,
            sprite: this.charClass.spriteKey,
        };
    }

    move(gridPositions: Cell[][]) {
        if (!this.sprite) return;

        const { x, y } = this.entity.position;
        const cell = gridPositions[x][y];

        this.sprite.setPosition(cell.pixelPosition.x, cell.pixelPosition.y);
    }

    async recalculate(): Promise<void> {
        return;
    }

    public enableClick() {
        this.sprite?.setInteractive();
    }

    public disableClick() {
        this.sprite?.disableInteractive();
    }

    public showPreview(show: boolean, action?: Action) {
        if (!this.sprite) return;
        const fightScene = this.scene as FightScene;

        this.sprite?.off("pointerover");
        this.sprite?.off("pointerout");

        const title = `❤️ ${this.entity.stats.life} PV`;

        if (!show) {
            fightScene.tooltip.attachTo(
                this.sprite!,
                this.charClass.name,
                title,
                undefined,
                this.sprite!,
            );
        } else {
            const estimatedDamage = action
                ? `Dégâts estimés : 12²` // ← ici tu peux calculer les dégâts estimés en fonction de l'action et des stats du personnage
                : "Aucune action sélectionnée";

            fightScene.tooltip.attachTo(
                this.sprite!,
                estimatedDamage, // ← description = dégâts estimés
                title,
                undefined,
                this.sprite!,
            );
        }
    }
}

