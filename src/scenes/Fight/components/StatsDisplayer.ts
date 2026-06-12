import { CharacterCloseupAsset, IconAsset, IconAssetId } from "../../../assets";
import { EffectAsset, EffectAssetId } from "../../../assets/EffectAsset";
import { Color } from "../../../config/ColorConfig";
import { CustomContainer, Grid, DisplayText, List } from "../../../core";
import { DisplayImage } from "../../../core/UI/Image";
import { CharacterClass } from "../../../Model/CharacterClass";
import { Effect } from "../../../Model/Effect";
import { Entity } from "../../../Model/Entity";
import { Stats, StatsUtils } from "../../../Model/Stats";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/GameStore";
import { FightSceneDisplayer } from "./FightSceneDisplayer";

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
    private EffectList!: List;
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

        this.statsPanel = new CustomContainer(this.scene, statsArea, {
            borderWidth: 6,
            opacity: 0.5,
        });

        const statsGrid = statsArea.getGrid();

        const imgArea = statsGrid.getArea({ x: 1, y: 1, width: 3, height: 4 });

        this.statsImage = new CustomContainer(this.scene, imgArea, {
            borderWidth: 7,
            backgroundImage: "unknown",
        });

        const classNameArea = statsGrid.getArea({
            x: 4,
            y: 1,
            width: 6,
            height: 1,
        });

        this.statsClassName = new CustomContainer(this.scene, classNameArea, {
            title: "N/A",
            borderWidth: 2,
            bgColor: Color.containerBorder,
        });
        const playerNameArea = statsGrid.getArea({
            x: 1,
            y: 5,
            width: 3,
            height: 1,
        });

        this.statsName = new CustomContainer(this.scene, playerNameArea, {
            title: "N/A",
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

        const effectListArea = statsGrid.getSubGrid(
            {
                x: 1,
                y: 6,
                width: 3,
                height: 4,
            },
            {
                division: {
                    horizontal: 3,
                    vertical: 4,
                },
            },
        );

        this.EffectList = new List(this.scene, effectListArea);

        return this;
    }

    render(): this {
        Object.values(IconAssetId).forEach((icon, index) => {
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
        this.displayEffects();
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

    displayEffects() {
        this.EffectList.clear();

        const groupedEffects = this.entity.effects.reduce((acc, effect) => {
            if (!acc.has(effect.id)) {
                acc.set(effect.id, []);
            }
            acc.get(effect.id)!.push(effect);
            return acc;
        }, new Map<EffectAssetId, Effect[]>());

        Array.from(groupedEffects.entries()).forEach(([id, effects], index) => {
            const iconObj = this.EffectList.placeContent(
                index,
                0,
                {
                    icon: EffectAsset.getAssetKey(id),
                    alpha: 1,
                },
                64,
            );

            const body = effects
                .map((effect) => {
                    const modified = Object.fromEntries(
                        Object.entries(effect.modifier).filter(
                            ([, value]) => value !== 0,
                        ),
                    );
                    const modifierLines = Object.entries(modified)
                        .map(
                            ([key, value]) =>
                                `${key}: ${value > 0 ? "+" : ""}${value}`,
                        )
                        .join("\n");
                    return `--------\n${modifierLines}\n${effect.author ?? ""}, durée : ${effect.duration}`;
                })
                .join("\n");

            const title = effects[0].name ?? id;

            if (iconObj) {
                iconObj.setInteractive();
                this.scene.tooltip.attachTo(iconObj, body, title);
            }
        });
    }

    async animate(): Promise<this> {
        return this;
    }
}

