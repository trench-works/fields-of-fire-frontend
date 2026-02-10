import { RenderResult, SceneRenderConfig } from "./GameScene";
import { Action } from "./Action";
import { Effect } from "./Effect";
import { GameObject, GameObjectProps } from "./GameObject";
import { Position, PositionUtils } from "./Position";
import { Stats } from "./Stats";
import { computeScaleFactor } from "../core/Utils";

export type CharactersProps = GameObjectProps & {
    position: Position;
    sprite: string;
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
    public name: string;
    public actionList: Action[];
    public baseStats: Stats;

    constructor({
        position,
        sprite,
        id,
        name,
        actionList,
        baseStats,
        scene,
    }: CharactersProps) {
        super({ scene });

        this.position = position;
        this.spriteKey = sprite;
        this.id = id;
        this.name = name;
        this.actionList = actionList;
        this.baseStats = baseStats;
    }

    get stats() {
        const stats = new Stats(
            this.baseStats.life,
            this.baseStats.precision, //boost ranged dammage
            this.baseStats.strength,

            this.baseStats.accuracy, //chance to hit
            this.baseStats.initiative,
            this.baseStats.energy,
            this.baseStats.mouvement,
        );

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

    //Spawne le personnage sur la scène, en créant son sprite et en le positionnant correctement sur la grille  
    spawn(scene: Phaser.Scene,scaleFactor: number, gridPositions: any[][]) {
        this.scene = scene;

        const { x, y } = this.position;
        const cell = gridPositions[y][x];

        this.sprite = scene.physics.add.sprite(
            cell.pixelPosition.x,
            cell.pixelPosition.y,
            this.spriteKey,
        );

        this.sprite.setDepth(5);
        this.sprite.setOrigin(0.5, 0.95);
        this.sprite.setScale(scaleFactor/1.5); ;

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
        repeat: number = -1,
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
            renderConfig,
        );
        return {
            position: renderPosition,
            sprite: this.spriteKey,
        };
    }

    async recalculate(): Promise<void> {
        return;
    }
}
