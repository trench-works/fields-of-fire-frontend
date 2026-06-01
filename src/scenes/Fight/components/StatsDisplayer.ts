import { Color } from "../../../config/ColorConfig";
import {
    CustomContainer,
    DataDisplayer,
    GridUtils,
    Position,
} from "../../../core";
import { CharacterClass } from "../../../Model/CharacterClass";
import { Entity } from "../../../Model/Entity";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/GameStore";
import { FightSceneDisplayer } from "./FightSceneDisplayer";

const allExistingStats: string[] = [
    "life",
    "initiative",
    "strength",
    "precision",
    "accuracy",
    "dodging",
    "energy",
    "mouvement",
];

const statDescriptions: Record<string, string> = {
    life: "Points de vie. S'ils tombent à 0, vous mourrez.",
    precision: "Augmente les dégâts des attaques à distance.",
    strength: "Augmente les dégâts des attaques au corps à corps.",
    accuracy: "Chance de toucher vos adversaires.",
    initiative: "Détermine l'ordre de passage dans le tour.",
    dodging: "Chance d'esquiver les attaques ennemies.",
    energy: "Points d'énergie nécessaires pour utiliser des actions.",
    mouvement: "Nombre de cases que vous pouvez parcourir par tour.",
};

export class StatsDisplayer extends FightSceneDisplayer {
    private statsPanel!: CustomContainer;
    private statsTable!: DataDisplayer;
    private statsImage!: CustomContainer;
    private statsClassName!: CustomContainer;
    private statsName!: CustomContainer;

    private lifeStat!: Phaser.GameObjects.Text;
    private strengthStat!: Phaser.GameObjects.Text;
    private accuracyStat!: Phaser.GameObjects.Text;
    private energyStat!: Phaser.GameObjects.Text;
    private initiativeStat!: Phaser.GameObjects.Text;
    private precisionStat!: Phaser.GameObjects.Text;
    private dodgingStat!: Phaser.GameObjects.Text;
    private mouvementStat!: Phaser.GameObjects.Text;

    /**
     * Data
     */
    private entity!: Entity;
    private characterClass!: CharacterClass;
    private name!: string;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly position: { x: number; y: number },
    ) {
        super(scene, gameStore);
    }

    setEntity(entity: Entity): this {
        this.entity = entity;
        return this;
    }

    setCharacterClass(characterClass: CharacterClass): this {
        this.characterClass = characterClass;
        return this;
    }

    setName(name: string): this {
        this.name = name;
        return this;
    }

    preRender(): this {
        // 1) Tu récupères la zone du panel dans la grille globale
        const statsArea = this.scene.sceneGrid.getArea(
            this.position.x,
            this.position.y,
            2,
            3,
        );

        // 2) Tu crées le panel
        this.statsPanel = new CustomContainer(this.scene, {
            title: "",
            x: statsArea.x + statsArea.width / 2,
            y: statsArea.y + statsArea.height / 2,
            width: statsArea.width,
            height: statsArea.height,
            borderWidth: 6,
            opacity: 0.5,
        });

        // 3) Tu crées une grille *interne* au panel
        const statsGrid = GridUtils.uiGrid(
            0,
            0,
            this.statsPanel.width,
            this.statsPanel.height,
        );

        const imgArea = statsGrid.getArea(0, 0, 3, 4);

        this.statsImage = new CustomContainer(this.scene, {
            title: "",
            x: this.statsPanel.x - this.statsPanel.width / 2 + imgArea.centerX,
            y: this.statsPanel.y - this.statsPanel.height / 2 + imgArea.centerY,
            width: imgArea.width,
            height: imgArea.height,
            borderWidth: 7,
            backgroundImage: "unknown",
        });

        const classNameArea = statsGrid.getArea(3, 0, 6, 1);

        this.statsClassName = new CustomContainer(this.scene, {
            title: "N/A",
            x:
                this.statsPanel.x -
                this.statsPanel.width / 2 +
                classNameArea.centerX,
            y:
                this.statsPanel.y -
                this.statsPanel.height / 2 +
                classNameArea.centerY,
            width: classNameArea.width,
            height: classNameArea.height,
            borderWidth: 2,
            bgColor: Color.containerBorder,
            fontSize: 18,
        });
        const playerNameArea = statsGrid.getArea(0, 4, 3, 1);

        this.statsName = new CustomContainer(this.scene, {
            title: "N/A",
            x:
                this.statsPanel.x -
                this.statsPanel.width / 2 +
                playerNameArea.centerX,
            y:
                this.statsPanel.y -
                this.statsPanel.height / 2 +
                playerNameArea.centerY,
            width: playerNameArea.width,
            height: playerNameArea.height,
            borderWidth: 2,
            bgColor: Color.containerBorder,
            fontSize: 18,
        });

        const statValuesArea = statsGrid.getArea(3, 1, 6, 8);

        this.statsTable = new DataDisplayer(this.scene, {
            position: new Position(
                this.statsPanel.x -
                    this.statsPanel.width / 2 +
                    statValuesArea.centerX,
                this.statsPanel.y -
                    this.statsPanel.height / 2 +
                    statValuesArea.centerY,
            ),
            width: statValuesArea.width,
            height: statValuesArea.height,
            cols: 4,
            rows: 4,
        });

        return this;
    }

    render(): this {
        allExistingStats.forEach((icon, index) => {
            const row = Math.floor(index / 2);
            const col = (index % 2) * 2;

            const iconObj = this.statsTable.placeContent(col, row, { icon });

            if (iconObj) {
                iconObj.setInteractive();
                this.scene.tooltip.attachTo(
                    iconObj,
                    statDescriptions[icon] ?? icon,
                    icon,
                );
            }
        });

        this.lifeStat = this.statsTable.placeText(1, 0, "N/A");
        this.strengthStat = this.statsTable.placeText(1, 1, "N/A");
        this.accuracyStat = this.statsTable.placeText(1, 2, "N/A");
        this.energyStat = this.statsTable.placeText(1, 3, "N/A");

        // second column
        this.initiativeStat = this.statsTable.placeText(3, 0, "N/A");
        this.precisionStat = this.statsTable.placeText(3, 1, "N/A");
        this.dodgingStat = this.statsTable.placeText(3, 2, "N/A");
        this.mouvementStat = this.statsTable.placeText(3, 3, "N/A");
        return this;
    }

    update(): this {
        this.lifeStat.setText(String(this.entity.stats.life));
        this.strengthStat.setText(String(this.entity.stats.strength));
        this.accuracyStat.setText(String(this.entity.stats.accuracy));
        this.energyStat.setText(String(this.entity.stats.energy));
        this.initiativeStat.setText(String(this.entity.stats.initiative));
        this.precisionStat.setText(String(this.entity.stats.precision));
        this.dodgingStat.setText(String(this.entity.stats.dodging));
        this.mouvementStat.setText(String(this.entity.stats.mouvement));

        this.statsName.setTitle(this.name);
        this.statsClassName.setTitle(this.characterClass.name);
        this.statsImage.setBackgroundImage(this.characterClass.iconImageKey);
        return this;
    }

    setIsShow(isShow: boolean): this {
        this.statsPanel.setVisible(isShow);
        this.statsTable.setVisible(isShow);
        this.statsImage.setVisible(isShow);
        this.statsClassName.setVisible(isShow);
        this.statsName.setVisible(isShow);

        this.lifeStat.setVisible(isShow);
        this.strengthStat.setVisible(isShow);
        this.accuracyStat.setVisible(isShow);
        this.energyStat.setVisible(isShow);
        this.initiativeStat.setVisible(isShow);
        this.precisionStat.setVisible(isShow);
        this.dodgingStat.setVisible(isShow);
        this.mouvementStat.setVisible(isShow);

        return this;
    }
}

