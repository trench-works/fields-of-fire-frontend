import { CharacterCloseupAsset, IconAsset } from "../../../assets";
import { Color } from "../../../config/ColorConfig";
import { CustomContainer, List } from "../../../core";
import { CharacterClass } from "../../../Model/CharacterClass";
import { Entity } from "../../../Model/Entity";
import { StatsUtils } from "../../../Model/Stats";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/GameStore";
import { FightSceneDisplayer } from "./FightSceneDisplayer";

const allExistingStats: string[] = [
    "life",
    "initiative",
    "strength",
    "precision",
    "armor",
    "dodging",
    "energy",
    "mouvement",
];

const statDescriptions: Record<string, string> = {
    life: "Points de vie. S'ils tombent à 0, vous mourrez.",
    precision: "Augmente les dégâts des attaques à distance.",
    strength: "Augmente les dégâts des attaques au corps à corps.",
    armor: "Réduit les dégâts subis.",
    initiative: "Détermine l'ordre de passage dans le tour.",
    dodging: "Chance d'esquiver les attaques ennemies.",
    energy: "Points d'énergie nécessaires pour utiliser des actions.",
    mouvement: "Nombre de cases que vous pouvez parcourir par tour.",
};

export class StatsDisplayer extends FightSceneDisplayer {
    private statsPanel!: CustomContainer;
    private statsTable!: List;
    private statsImage!: CustomContainer;
    private statsClassName!: CustomContainer;
    private statsName!: CustomContainer;

    private lifeStat!: Phaser.GameObjects.Text;
    private strengthStat!: Phaser.GameObjects.Text;
    private armorStat!: Phaser.GameObjects.Text;
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
    private show!: boolean;

    get entityId() {
        return this.entity.entityId;
    }

    get isShow() {
        return this.show;
    }

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
        const statsArea = this.scene.rootGrid.getArea({
            x: this.position.x,
            y: this.position.y,
            width: 2,
            height: 3,
        });

        this.statsPanel = new CustomContainer(this.scene, {
            x: statsArea.center.x,
            y: statsArea.center.y,
            width: statsArea.width,
            height: statsArea.height,
            borderWidth: 6,
            opacity: 0.5,
        });

        const statsGrid = statsArea.getGrid();

        const imgArea = statsGrid.getArea({ x: 1, y: 1, width: 3, height: 4 });

        this.statsImage = new CustomContainer(this.scene, {
            x: imgArea.center.x,
            y: imgArea.center.y,
            width: imgArea.width,
            height: imgArea.height,
            borderWidth: 7,
            backgroundImage: "unknown",
        });

        const classNameArea = statsGrid.getArea({
            x: 4,
            y: 1,
            width: 6,
            height: 1,
        });

        this.statsClassName = new CustomContainer(this.scene, {
            title: "N/A",
            x: classNameArea.center.x,
            y: classNameArea.center.y,
            width: classNameArea.width,
            height: classNameArea.height,
            borderWidth: 2,
            bgColor: Color.containerBorder,
            fontSize: 18,
        });
        const playerNameArea = statsGrid.getArea({
            x: 1,
            y: 5,
            width: 3,
            height: 1,
        });

        this.statsName = new CustomContainer(this.scene, {
            title: "N/A",
            x: playerNameArea.center.x,
            y: playerNameArea.center.y,
            width: playerNameArea.width,
            height: playerNameArea.height,
            borderWidth: 2,
            bgColor: Color.containerBorder,
            fontSize: 18,
        });

        const statValuesArea = statsGrid.getSubGrid(
            {
                x: 5.5,
                y: 4,
                width: 6,
                height: 8,
            },
            {
                division: {
                    horizontal: 4,
                    vertical: 4,
                },
            },
        );

        this.statsTable = new List(this.scene, statValuesArea);

        return this;
    }

    render(): this {
        allExistingStats.forEach((icon, index) => {
            const row = Math.floor(index / 2);
            const col = (index % 2) * 2;

            const iconObj = this.statsTable.placeContent(col, row, {
                icon: IconAsset.getAssetKey(icon),
            });

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
        this.armorStat = this.statsTable.placeText(1, 2, "N/A");
        this.energyStat = this.statsTable.placeText(1, 3, "N/A");

        // second column
        this.initiativeStat = this.statsTable.placeText(3, 0, "N/A");
        this.precisionStat = this.statsTable.placeText(3, 1, "N/A");
        this.dodgingStat = this.statsTable.placeText(3, 2, "N/A");
        this.mouvementStat = this.statsTable.placeText(3, 3, "N/A");
        return this;
    }

    update(): this {
        const stats = StatsUtils.fromEntity(this.entity);

        this.lifeStat.setText(String(stats.life));
        this.strengthStat.setText(String(stats.strength));
        this.armorStat.setText(String(stats.armor));
        this.energyStat.setText(String(stats.energy));
        this.initiativeStat.setText(String(stats.initiative));
        this.precisionStat.setText(String(stats.precision));
        this.dodgingStat.setText(String(stats.dodging));
        this.mouvementStat.setText(String(stats.mouvement));

        this.statsName.setTitle(this.name);
        this.statsClassName.setTitle(this.characterClass.name);
        this.statsImage.setBackgroundImage(
            CharacterCloseupAsset.getAssetKey(this.entity.classId),
        );
        return this;
    }

    setIsShow(isShow: boolean): this {
        this.show = isShow;

        this.statsPanel.setVisible(isShow);
        this.statsTable.setVisible(isShow);
        this.statsImage.setVisible(isShow);
        this.statsClassName.setVisible(isShow);
        this.statsName.setVisible(isShow);

        this.lifeStat.setVisible(isShow);
        this.strengthStat.setVisible(isShow);
        this.armorStat.setVisible(isShow);
        this.energyStat.setVisible(isShow);
        this.initiativeStat.setVisible(isShow);
        this.precisionStat.setVisible(isShow);
        this.dodgingStat.setVisible(isShow);
        this.mouvementStat.setVisible(isShow);

        return this;
    }

    async animate(): Promise<this> {
        return this;
    }
}

