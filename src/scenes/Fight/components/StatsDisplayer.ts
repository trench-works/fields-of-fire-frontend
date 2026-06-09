import { CharacterCloseupAsset, IconAsset } from "../../../assets";
import { Color } from "../../../config/ColorConfig";
import { CustomContainer, Grid, DisplayText } from "../../../core";
import { DisplayImage } from "../../../core/UI/Image";
import { CharacterClass } from "../../../Model/CharacterClass";
import { Entity } from "../../../Model/Entity";
import { Stats, StatsUtils } from "../../../Model/Stats";
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
    private statsImage!: CustomContainer;
    private statsClassName!: CustomContainer;
    private statsName!: CustomContainer;
    private statsValuesGrid!: Grid;

    protected statTexts: Map<
        string,
        { text: DisplayText; image: DisplayImage }
    >;

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
        this.statTexts = new Map();
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
        });

        this.statsValuesGrid = statsGrid.getSubGrid(
            {
                x: 4,
                y: 2,
                width: 6,
                height: 8,
                margin: 10,
            },
            {
                division: {
                    horizontal: 2,
                    vertical: 4,
                },
            },
        );

        return this;
    }

    render(): this {
        allExistingStats.forEach((icon, index) => {
            const row = Math.floor(index / 2) + 1;
            const col = (index % 2) + 1;

            const statGrid = this.statsValuesGrid.getSubGrid(
                {
                    x: col,
                    y: row,
                },
                { division: { horizontal: 2, vertical: 1 }, padding: 10 },
            );

            // Image
            const imageArea = statGrid.getArea({
                x: 1,
                y: 1,
            });
            const image = new DisplayImage(this.scene, imageArea).setImage(
                IconAsset.getAssetKey(icon),
                IconAsset.getAssetScale(icon),
            );
            if (image) {
                image.setInteractive(true);
                this.scene.tooltip.attachTo(
                    image.getObject(),
                    statDescriptions[icon] ?? icon,
                    icon,
                );
            }

            // Text
            const textArea = statGrid.getArea({
                x: 2,
                y: 1,
            });
            this.statTexts.set(icon, {
                text: new DisplayText(this.scene, textArea).setText("N/A"),
                image,
            });
        });

        return this;
    }

    update(): this {
        const stats = StatsUtils.fromEntity(this.entity);

        this.statTexts.forEach(({ text }, key) =>
            text.setText(String(stats[key as keyof Stats]), { fontSize: 20 }),
        );

        this.statsName.setText(this.name);
        this.statsClassName.setText(this.characterClass.name);
        this.statsImage.setBackgroundImage(
            CharacterCloseupAsset.getAssetKey(this.entity.classId),
        );
        return this;
    }

    setIsShow(isShow: boolean): this {
        this.show = isShow;

        this.statsPanel.setVisible(isShow);
        this.statsImage.setVisible(isShow);
        this.statsClassName.setVisible(isShow);
        this.statsName.setVisible(isShow);

        this.statTexts.forEach(({ text, image }) => {
            text.setVisible(isShow);
            image.setVisible(isShow);
        });

        return this;
    }

    async animate(): Promise<this> {
        return this;
    }
}

