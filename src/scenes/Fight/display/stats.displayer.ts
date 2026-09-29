import {
    CharacterCloseupAsset,
    StatsIconAsset,
    StatsAssetId,
} from "../../../assets";
import { EffectAsset, EffectAssetId } from "../../../assets/EffectAsset";
import { Color } from "../../../config/ColorConfig";
import {
    DisplayContainer,
    Grid,
    DisplayText,
    GridArea,
    ScaleMode,
    i18n,
    Depth,
    UI_LEVELS_OFFSET,
} from "../../../core";
import { DisplayImage } from "../../../core/UI/DisplayImage";
import { CharacterClass } from "../../../Model/CharacterClass";
import { Effect } from "../../../Model/Effect";
import { Entity } from "../../../Model/Entity";
import { Stats, StatsUtils } from "../../../Model/Stats";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/game.store";
import { StatsStore } from "../stores/stats.store";
import { FightSceneDisplayer } from "./base/fight-scene.displayer";

const statDescriptions: Record<string, string> = {
    life: "Points de vie. S'ils tombent à 0, vous mourrez.",
    precision: "Augmente les dégâts des attaques à distance.",
    strength: "Augmente les dégâts des attaques au corps à corps.",
    armor: "Réduit les dégâts subis.",
    initiative: "Détermine l'ordre de passage dans le tour.",
    dodging: "Chance d'esquiver les attaques ennemies.",
    intelligence: "Augmente l'efficacité des capacités de soin",
    critical: "Augmente les chances de coups critiques",
    energy: "Points d'énergie nécessaires pour utiliser des actions.",
    mouvement: "Nombre de cases que vous pouvez parcourir par tour.",
};

export class StatsDisplayer extends FightSceneDisplayer {
    private statsArea!: GridArea;

    private statsPanel!: DisplayContainer;
    private effectListGrid!: Grid;
    protected effectImages: DisplayImage[] = [];
    private statsImage!: DisplayContainer;
    private statsClassName!: DisplayContainer;
    private playerName!: DisplayContainer;
    private statsValuesGrid!: Grid;
    private playerNameText!: DisplayText;
    private statsClassNameText!: DisplayText;

    protected statTexts: Map<
        keyof Stats,
        { text: DisplayText; image: DisplayImage }
    >;

    public statsStore: StatsStore;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly position: { x: number; y: number },
    ) {
        super(scene, gameStore);
        this.statTexts = new Map();
        this.statsStore = new StatsStore();
    }

    setEntity(entity: Entity): this {
        this.statsStore.entity = entity;
        return this;
    }

    setCharacterClass(characterClass: CharacterClass): this {
        this.statsStore.characterClass = characterClass;
        return this;
    }

    setName(name: string): this {
        this.statsStore.name = name;
        return this;
    }

    preRender(): this {
        this.statsArea = this.scene.rootGrid.getArea({
            x: this.position.x,
            y: this.position.y,
            width: 2,
            height: 3,
        });

        this.statsPanel = new DisplayContainer(this.scene, this.statsArea, {
            borderWidth: 7,
            opacity: 0.5,
            outterRadius: { tl: 10, tr: 10, bl: 0, br: 0 },
        }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.CONTAINER));

        const statsGrid = this.statsArea.getGrid();

        this.statsImage = new DisplayContainer(
            this.scene,
            statsGrid.getArea({ x: 1, y: 1, width: 3, height: 4 }),
            {
                borderWidth: 7,
                backgroundImage: "unknown",
                outterRadius: { tl: 10, tr: 0, bl: 0, br: 0 },
            },
        ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.CONTAINER) + 1);

        this.statsClassName = new DisplayContainer(
            this.scene,
            statsGrid.getArea({
                x: 4,
                y: 1,
                width: 6,
                height: 1,
            }),
            {
                borderWidth: 2,
                bgColor: Color.MILITARY_GREEN,
                outterRadius: { tl: 0, tr: 10, bl: 0, br: 0 },
            },
        ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.CONTAINER) + 1);

        this.statsClassNameText = new DisplayText(
            this.scene,
            statsGrid.getArea({
                x: 4,
                y: 1,
                width: 6,
                height: 1,
            }),
        ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.CONTAINER + 1));

        this.playerName = new DisplayContainer(
            this.scene,
            statsGrid.getArea({
                x: 1,
                y: 5,
                width: 3,
                height: 1,
            }),
            {
                borderWidth: 7,
                bgColor: Color.MILITARY_GREEN,
                outterRadius: { tl: 0, tr: 0, bl: 0, br: 10 },
            },
        ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.CONTAINER + 1));

        this.playerNameText = new DisplayText(
            this.scene,
            statsGrid.getArea({
                x: 1,
                y: 5,
                width: 3,
                height: 1,
            }),
        ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.CONTAINER + 2));

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
                    vertical: 5,
                },
            },
        );

        this.effectListGrid = statsGrid.getSubGrid(
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
                padding: { left: 0, top: 10, bottom: 0, right: 0 },
            },
        );

        return this;
    }

    blurOut(): this {
        // this.statsImage.blur();
        // this.statsPanel.blur();
        // this.playerName.blur();
        // this.playerNameText.blur();
        // this.statsClassName.blur();
        // this.statsClassNameText.blur();
        // this.effectImages.forEach((image) => image.blur());
        // this.statTexts.forEach(({ text, image }) => {
        //     text.blur();
        //     image.blur();
        // });
        return this;
    }

    unblur(): this {
        // this.statsImage.unblur();
        // this.statsPanel.unblur();
        // this.playerName.unblur();
        // this.playerNameText.unblur();
        // this.statsClassName.unblur();
        // this.statsClassNameText.unblur();
        // this.effectImages.forEach((image) => image.unblur());
        // this.statTexts.forEach(({ text, image }) => {
        //     text.unblur();
        //     image.unblur();
        // });
        return this;
    }

    render(): this {
        Object.values(StatsAssetId).forEach((icon, index) => {
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
            const image = new DisplayImage(
                this.scene,
                statGrid
                    .getArea({
                        x: 1,
                        y: 1,
                    })
                    .scaleFromCenter(1, ScaleMode.FIT),
            )
                .setImage(StatsIconAsset.getAssetKey(icon), {
                    scale: StatsIconAsset.getAssetScale(icon),
                })
                .setDepth(
                    Depth.getUIElementDepth(UI_LEVELS_OFFSET.CONTAINER + 1),
                );
            if (image && this.statsStore.entity) {
                image.setInteractive(true);
                this.scene.tooltip.attachTo(
                    image.getObject(),
                    statDescriptions[icon] ?? icon,
                    icon === "life"
                        ? `${icon} (Max: ${StatsUtils.fromEntity(this.statsStore.entity).maxLife})`
                        : icon,
                );
            }

            // Text
            this.statTexts.set(icon, {
                text: new DisplayText(
                    this.scene,
                    statGrid.getArea({
                        x: 2,
                        y: 1,
                    }),
                )
                    .setText("N/A")
                    .setDepth(
                        Depth.getUIElementDepth(UI_LEVELS_OFFSET.CONTAINER + 1),
                    ),
                image,
            });
        });

        return this;
    }

    update(): this {
        if (this.statsStore.entity) {
            const stats = StatsUtils.fromEntity(this.statsStore.entity);

            if (this.statsStore.entity.dead) {
                this.blurOut();
            } else {
                this.unblur();
            }

            this.statTexts.forEach(({ text }, key) => {
                let value = stats[key];
                if (["life", "mouvement", "energy"].includes(key)) {
                    value = Math.max(value, 0);
                }

                text.setText(String(value), { fontSize: 20 });
            });

            this.playerNameText.setText(this.statsStore.name ?? "N/A");
            if (this.statsStore.characterClass) {
                this.statsClassNameText.setText(
                    this.statsStore.characterClass.name ?? "N/A",
                );
            }
            this.statsImage.setBackgroundImage(
                CharacterCloseupAsset.getAssetKey(
                    this.statsStore.entity.classId,
                ),
            );
            this.displayEffects();
        }
        return this;
    }

    setIsShow(isShow: boolean): this {
        console.log("IS SHOW CALLED WITH", isShow);
        this.statsStore.show = isShow;

        this.statsPanel.setVisible(isShow);
        this.statsImage.setVisible(isShow);
        this.statsClassName.setVisible(isShow);
        this.statsClassNameText.setVisible(isShow);
        this.playerName.setVisible(isShow);
        this.playerNameText.setVisible(isShow);

        this.effectImages.forEach((img) => {
            img.setVisible(isShow);
        });

        this.statTexts.forEach(({ text, image }) => {
            text.setVisible(isShow);
            image.setVisible(isShow);
        });

        return this;
    }

    displayEffects() {
        // Détruit les anciennes images
        this.effectImages.forEach((img) => img.destroy());
        this.effectImages = [];

        if (this.statsStore.entity) {
            const groupedEffects = this.statsStore.entity.effects.reduce(
                (acc, effect) => {
                    if (!acc.has(effect.id)) acc.set(effect.id, []);
                    acc.get(effect.id)!.push(effect);
                    return acc;
                },
                new Map<EffectAssetId, Effect[]>(),
            );

            Array.from(groupedEffects.entries()).forEach(
                ([id, effects], index) => {
                    const col = (index % 3) + 1;
                    const row = Math.floor(index / 3) + 1;

                    const area = this.effectListGrid.getArea({
                        x: col,
                        y: row,
                    });

                    const image = new DisplayImage(
                        this.scene,
                        area.scaleFromCenter(1, ScaleMode.FIT),
                    )
                        .setImage(EffectAsset.getAssetKey(id), { scale: 1.2 })
                        .setInteractive(true)
                        .setDepth(
                            Depth.getUIElementDepth(
                                UI_LEVELS_OFFSET.CONTAINER + 2,
                            ),
                        );
                    if (this.statsStore.entity?.dead) {
                        //image.blur();
                    }

                    const body = effects
                        .map((effect) => {
                            const modified = Object.fromEntries(
                                Object.entries(effect.modifier).filter(
                                    ([, value]) => value !== 0,
                                ),
                            );
                            if (Object.keys(modified).length === 0) {
                                return `${effect.author ? effect.author + ", " : ""}${i18n.translate("fight.effects.duration")} : ${effect.duration ?? "∞"}`;
                            }
                            const modifierLines = Object.entries(modified)
                                .map(
                                    ([key, value]) =>
                                        `${key}: ${value > 0 ? "+" : ""}${value}`,
                                )
                                .join("\n");
                            return `--------\n${modifierLines}\n${effect.author ? effect.author + ", " : ""}${i18n.translate("fight.effects.duration")} : ${effect.duration ?? "∞"}`;
                        })
                        .join("\n");

                    this.scene.tooltip.attachTo(
                        image.getObject(),
                        body,
                        effects[0].name ?? id,
                    );
                    this.effectImages.push(image);
                },
            );
        }
    }

    async animate(): Promise<this> {
        return this;
    }
}

