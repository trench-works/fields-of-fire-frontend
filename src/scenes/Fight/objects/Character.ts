import {
    RenderResult,
    SceneRenderConfig,
    GameObject,
    GameObjectProps,
    Position,
    PositionUtils,
} from "../../../core";
import { Action } from "../../../Model/Action";
import { Effect } from "../../../Model/Effect";
import { Stats } from "../../../Model/Stats";

export type CharactersProps = GameObjectProps & {
    position: Position;
    spriteKey: string;
    iconImageKey: string;
    id: string;
    name: string;
    actionList: Action[];
    baseStats: Stats;
};

export class Character extends GameObject {
    public currentEffect: Effect[] = [];
    public position: Position;
    public spriteKey: string;
    protected sprite: Phaser.GameObjects.Sprite | undefined;
    public id: string;
    public iconImageKey: string;
    public name?: string;
    public actionList: Action[];
    public baseStats: Stats;

    constructor({
        position,
        spriteKey,
        iconImageKey,
        id,
        name,
        actionList,
        baseStats,
        scene,
    }: CharactersProps) {
        super({ scene });

        this.position = position;
        this.spriteKey = spriteKey;
        this.iconImageKey = iconImageKey;
        this.id = id;
        this.name = name;
        this.actionList = actionList;
        this.baseStats = baseStats;
    }

    get stats() {
        const stats = new Stats({
            life: this.baseStats.life,
            precision: this.baseStats.precision, //boost ranged dammage
            strength: this.baseStats.strength,
            accuracy: this.baseStats.accuracy, //chance to hit
            initiative: this.baseStats.initiative,
            energy: this.baseStats.energy,
            mouvement: this.baseStats.mouvement,
            dodging: 0, // TODO: change this value
        });

        this.currentEffect.forEach((effect) => {
            stats.addLife(effect.statModification.life);
            stats.addPrecision(effect.statModification.precision);
            stats.addStrengh(effect.statModification.precision);
            stats.addAccuracy(effect.statModification.accuracy);
            stats.addInitiative(effect.statModification.initiative);
            stats.addEnergy(effect.statModification.energy);
            stats.addMouvement(effect.statModification.mouvement);
        });

        return stats;
    }

    preload(loader: Phaser.Loader.LoaderPlugin) {
        if (this.spriteKey) {
                loader.spritesheet(
                    this.spriteKey,
                    `assets/Sprites/${this.spriteKey}.png`,
                    { frameWidth: 96, frameHeight: 128 }
                );
                loader.image(
                    this.iconImageKey,
                    `assets/${this.iconImageKey}.png`
                );

                this.actionList.forEach((action) => {
                    if (action.id) {
                        loader.image(
                            action.id,
                            `assets/action/${action.id}.png`
                        );
                        console.log(
                            `assets/action/${action.id}.png`
                        );
                    }
                });
            }
    }

    //Spawne le personnage sur la scène, en créant son sprite et en le positionnant correctement sur la grille
    spawn(scene: Phaser.Scene, scaleFactor: number, gridPositions: any[][]) {
        this.scene = scene;

        const { x, y } = this.position;
        const cell = gridPositions[y][x];

        this.sprite = scene.physics.add.sprite(
            cell.pixelPosition.x,
            cell.pixelPosition.y,
            this.spriteKey
        );

        this.sprite.setDepth(5);
        this.sprite.setOrigin(0.5, 0.95);
        this.sprite.setScale(scaleFactor / 1.5);

        this.createAnimations(this.spriteKey);
    }

    //Joue l'animation d'idle par défaut du personnage, ou une animation spécifique si une clé est fournie
    playAnimation(key: string = this.spriteKey + "-idle-DR") {
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
        repeat: number = -1
    ) {
        this.scene.anims.create({
            key: `${animationName}`,
            frames: this.scene.anims.generateFrameNumbers(this.spriteKey, {
                start: startFrame,
                end: endFrame,
            }),
            frameRate: frameRate,
            repeat: repeat,
        });
    }
    render(renderConfig: SceneRenderConfig): RenderResult {
        const renderPosition = PositionUtils.getPixelsFromPosition(
            this.position,
            renderConfig
        );
        return {
            position: renderPosition,
            sprite: this.spriteKey,
        };
    }

    move(newPosition: Position, gridPositions: any[][]) {
        this.position = newPosition;

        if (!this.sprite) return;

        const { x, y } = newPosition;
        const cell = gridPositions[y][x];

        this.sprite.setPosition(cell.pixelPosition.x, cell.pixelPosition.y);
    }

    async recalculate(): Promise<void> {
        return;
    }
}

