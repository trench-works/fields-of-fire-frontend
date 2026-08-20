import { CharacterCloseupAsset } from "../../../assets";
import { BoostAsset, BoostAssetId } from "../../../assets/BoostAsset";
import { Color } from "../../../config/ColorConfig";
import {
    Button,
    Depth,
    DisplayContainer,
    DisplayRoot,
    DisplayText,
    Grid,
    List,
    ScaleMode,
    UI_LEVELS_OFFSET,
} from "../../../core";
import { DisplayImage } from "../../../core/UI/DisplayImage";
import { Boost } from "../../../Model/Boost";
import { Entity } from "../../../Model/Entity";
import { MainMenu } from "../../MainMenu/main-menu.scene";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/game.store";
import { PlayerStore } from "../stores/player.store";
import { FightSceneDisplayer } from "./base/fight-scene.displayer";

export class EndFightDisplayer extends FightSceneDisplayer {
    /**
     * Displayed Elements
     */
    protected actionElements: Map<string, Button> = new Map();
    protected endTurnButton!: Button;
    protected actionsList!: List;
    protected entityList!: List;
    protected buttonsGrid!: Grid;

    protected selectedBoostCard?: DisplayContainer;
    protected boostCards: Map<string, DisplayContainer> = new Map();

    protected boostId: string | null = null;
    protected boosts!: Boost[];

    protected root: DisplayRoot;
    protected temporaryRoot: DisplayRoot;
    protected buttonsRoot: DisplayRoot;

    protected titleText!: DisplayText;

    protected isReady: boolean = false;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly playerStore: PlayerStore,
    ) {
        super(scene, gameStore);
        this.root = new DisplayRoot();
        this.temporaryRoot = new DisplayRoot();
        this.buttonsRoot = new DisplayRoot();
    }
    preRender(): this {
        this.root.add(
            new DisplayContainer(
                this.scene,
                this.scene.rootGrid.getArea({
                    x: 1,
                    y: 1,
                    width: 9,
                    height: 9,
                }),
                {
                    borderWidth: 6,
                    opacity: 0.5,
                },
            ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP)),
        );

        const endGameArea = this.scene.rootGrid.getArea({
            x: 2,
            y: 2,
            width: 7,
            height: 6,
        });

        this.root.add(
            new DisplayContainer(this.scene, endGameArea, {
                borderWidth: 6,
                opacity: 1,
            }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 1),
        );

        const titleEndgameGrid = endGameArea.getGrid();

        const titleEndgameArea = titleEndgameGrid.getArea({
            x: 3,
            y: 0,
            width: 5,
            height: 2,
        });

        this.root.add(
            new DisplayContainer(this.scene, titleEndgameArea, {
                borderWidth: 6,
                opacity: 1,
            }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 1),
        );

        this.titleText = new DisplayText(this.scene, titleEndgameArea);
        this.root.add(this.titleText);

        // --- Depths ---
        this.titleText.setDepth(
            Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 2,
        );

        this.root.setVisible(false);

        return this;
    }

    render(): this {
        const entities = this.gameStore.game.entities.filter(
            (entity) => !entity.isInvocation,
        );
        const rowCount = entities.length;

        const entityListGrid = this.scene.rootGrid.getSubGrid(
            {
                x: 2,
                y: 2,
                width: 7,
                height: 6,
            },
            {
                division: {
                    horizontal: rowCount,
                    vertical: 8,
                },
                margin: {
                    top: 20,
                    bottom: 0,
                    left: 10,
                    right: 10,
                },
                padding: 20,
            },
        );
        this.entityList = new List(this.scene, entityListGrid);
        //new DisplayContainer(this.scene, entityListGrid.getArea({ x:1,y:1, width : 6, height:8 }), {bgColor:"#a7441c"}).setDepth(9999999999);
        entities.forEach((entity, index) => {
            this.displayEntityCard(
                entity,
                entityListGrid.getSubGrid(
                    {
                        x: index + 1,
                        y: 1,
                        width: 1,
                        height: 5,
                    },
                    {
                        division: { horizontal: 3, vertical: 3 },
                    },
                ),
            );
        });
        this.entityList.setDepth(
            Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3,
        );

        this.root.setVisible(false);
        this.temporaryRoot.setVisible(false);

        if (this.gameStore.game.isStopped) {
            this.show(
                this.gameStore.game.playerWin,
                this.playerStore.player.randomBoost,
            );
        }

        return this;
    }

    update(): this {
        return this;
    }

    reset(): this {
        this.root.setVisible(false);
        this.temporaryRoot.destroy();
        this.temporaryRoot = new DisplayRoot();
        this.buttonsRoot.destroy();
        this.buttonsRoot = new DisplayRoot();
        return this;
    }

    show(playerWin: boolean, boosts: Boost[]) {
        this.boosts = boosts;
        this.isReady = this.gameStore.game.readyPlayers.includes(
            this.playerStore.player.id,
        );

        this.buttonsRoot.destroy();
        this.buttonsRoot = new DisplayRoot();

        this.temporaryRoot.destroy();
        this.temporaryRoot = new DisplayRoot();

        this.titleText.setText(playerWin ? "Victoire !" : "Défaite ");
        this.showEntityCards();
        this.showButtons(playerWin ? true : false);
        this.root.setVisible(true);
        this.temporaryRoot.setVisible(true);
    }

    showEntityCards(): void {
        const entities = this.gameStore.game.entities.filter(
            (entity) => !entity.isInvocation,
        );
        const rowCount = entities.length;

        const entityListGrid = this.scene.rootGrid.getSubGrid(
            {
                x: 2,
                y: 2,
                width: 7,
                height: 6,
            },
            {
                division: {
                    horizontal: rowCount,
                    vertical: 8,
                },
                margin: {
                    top: 20,
                    bottom: 0,
                    left: 10,
                    right: 10,
                },
                padding: 20,
            },
        );

        entities.forEach((entity, index) => {
            this.displayEntityCard(
                entity,
                entityListGrid.getSubGrid(
                    {
                        x: index + 1,
                        y: 1,
                        width: 1,
                        height: 5,
                    },
                    {
                        division: { horizontal: 3, vertical: 3 },
                    },
                ),
            );
        });
    }

    onBoostClick(boostId: string, card: DisplayContainer) {
        this.boostId = boostId;

        if (this.selectedBoostCard) {
            this.selectedBoostCard.setBackgroundColor(Color.BUTTON_BORDER);
        }

        card.setBackgroundColor(Color.CURRENT_TURN_BORDER);
        this.selectedBoostCard = card;
    }

    onReady() {
        if (!this.isReady) {
            this.isReady = true;
            this.scene.root.controllers.game.readyForNewGame(this.boostId);
        }
        this.temporaryRoot.destroy();
    }

    async animate(): Promise<this> {
        return this;
    }

    displayEntityCard(entity: Entity, ObjectListGrid: Grid): void {
        // Conteneur de la card
        this.temporaryRoot.add(
            new DisplayContainer(
                this.scene,
                ObjectListGrid.getArea({
                    x: 1,
                    y: 1,
                    width: 3,
                    height: 4,
                    margin: { top: 50, bottom: 0, right: 0, left: 0 },
                }),
                {
                    borderWidth: 3,
                    opacity: 1,
                    bgColor:
                        entity.teamId === this.playerStore.playerEntity.teamId
                            ? "#396645"
                            : "#6e3822",
                },
            ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 1),
        );

        this.temporaryRoot.add(
            new DisplayImage(
                this.scene,
                ObjectListGrid.getArea({
                    x: 2,
                    y: 1,
                    width: 1,
                    height: 3,
                }).scaleFromCenter(1, ScaleMode.FIT),
            )
                .setImage(CharacterCloseupAsset.getAssetKey(entity.classId))
                .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 2),
        );

        // Nom (ligne 3)
        this.temporaryRoot.add(
            new DisplayText(
                this.scene,
                ObjectListGrid.getArea({
                    x: 1,
                    y: 3,
                    width: 3,
                    height: 1,
                }),
            )
                .setText(entity.classId)
                .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 6),
        );
    }

    displayBoostCard(boost: Boost, entityListGrid: Grid, index: number) {
        // Conteneur de la card
        const boostCard = new DisplayContainer(
            this.scene,
            entityListGrid.getArea({
                x: 1,
                y: 1,
                width: 5,
                height: 4,
                margin: {
                    top: 40 * this.scene.scaleFactor,
                    bottom: 10,
                    right: 10,
                    left: 10,
                },
            }),
            {
                borderWidth: 3,
                opacity: 1,
                bgColor: Color.BUTTON_BACKGROUND,
                onClick: () => {
                    this.onBoostClick(boost.id, boostCard);
                    //TODO: FIXME: maybe change logic, first one is for select, second one is sending event to back
                },
            },
        ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 1);
        this.boostCards.set(`${boost.id}-${index}`, boostCard);
        this.temporaryRoot.add(boostCard);
        // Image (ligne 1)
        this.temporaryRoot.add(
            new DisplayImage(
                this.scene,
                entityListGrid
                    .getArea({
                        x: 3,
                        y: 1,
                        width: 1,
                        height: 1,
                        margin: { top: 10, bottom: -8, left: 0, right: 0 },
                    })
                    .scaleFromCenter(1, ScaleMode.FIT),
            )
                .setImage(BoostAsset.getAssetKey(boost.id))
                .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );

        // Nom (ligne 2)
        this.temporaryRoot.add(
            new DisplayContainer(
                this.scene,
                entityListGrid.getArea({
                    x: 1,
                    y: 2,
                    width: 5,
                    height: 1,
                    margin: { top: 10, bottom: 0, left: 0, right: 0 },
                }),
                {
                    borderWidth: 3,
                    innerRadius: 0,
                    onClick: () => this.onBoostClick(boost.id, boostCard),
                },
            ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 2),
        );
        this.temporaryRoot.add(
            new DisplayText(
                this.scene,
                entityListGrid.getArea({
                    x: 2,
                    y: 2,
                    width: 3,
                    height: 1,
                    margin: { top: 10, bottom: 0, left: 0, right: 0 },
                }),
            )
                .setText(boost.name)
                .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3),
        );

        // Modifiers non nuls (ligne 3)
        let statLine: string;
        switch (boost.id) {
            case BoostAssetId.VAMPIRE:
                statLine = "Vol de vie : +10%";
                break;
            case BoostAssetId.MASOCHISTIC:
                statLine = [
                    "+20% de dommages",
                    "vous subisser la moitiée",
                    "de ces dommages",
                ].join("\n");
                break;
            case BoostAssetId.REACTION:
                statLine = [
                    "life: +8",
                    "strength: +10",
                    "precision: +10",
                    "initiative: +15",
                    "esquive: +2",
                    "armor: +5",
                ].join("\n");
                break;
            case BoostAssetId.CRIT_CHANCE:
                statLine = "chance de critique : +3%";
                break;
            case BoostAssetId.CRIT_DAMMAGE:
                statLine = "dégats de critique : +25%";
                break;
            default:
                statLine = boost.boosts
                    .flatMap((stat) => Object.entries(stat))
                    .filter(([, value]) => value !== undefined && value !== 0)
                    .map(
                        ([key, value]) =>
                            `${key}: ${value > 0 ? "+" : ""}${value}`,
                    )
                    .join("\n");
        }

        if (statLine) {
            this.temporaryRoot.add(
                new DisplayText(
                    this.scene,
                    entityListGrid.getArea({ x: 2, y: 3, width: 3, height: 1 }),
                )
                    .setText(statLine)
                    .setDepth(
                        Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 5,
                    ),
            );
        }

        // Description (ligne 4)
        if (boost.name) {
            this.temporaryRoot.add(
                new DisplayText(
                    this.scene,
                    entityListGrid.getArea({
                        x: 1,
                        y: 4,
                        width: 5,
                        height: 1,
                        margin: { top: 0, bottom: 0, left: 10, right: 10 },
                    }),
                )
                    .setDescription(boost.name)
                    .setDepth(
                        Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 1,
                    ),
            );
        }
    }

    showButtons(isVictory: boolean) {
        this.buttonsGrid = this.scene.rootGrid.getSubGrid(
            {
                x: 3,
                y: 7,
                width: 5,
                height: 1,
                margin: { bottom: 10, top: 0, left: 0, right: 0 },
            },
            {
                division: {
                    horizontal: 9,
                    vertical: 1,
                },
                padding: 5,
            },
        );

        if (isVictory) {
            this.buttonsRoot.add(
                new Button(
                    this.scene,
                    this.buttonsGrid.getArea({
                        x: 2,
                        y: 1,
                        width: 3,
                        height: 1,
                    }),
                    {
                        onClick: () => {
                            console.log("nextRound");
                            this.temporaryRoot.destroy();
                            const boostListGrid =
                                this.scene.rootGrid.getSubGrid(
                                    { x: 2, y: 2, width: 7, height: 5 },
                                    {
                                        division: {
                                            horizontal: this.boosts.length,
                                            vertical: 4,
                                        },
                                        margin: {
                                            top: 30 * this.scene.scaleFactor,
                                            bottom: 0,
                                            left: 10,
                                            right: 10,
                                        },
                                    },
                                );

                            this.boosts.forEach((boost, index) => {
                                this.displayBoostCard(
                                    boost,
                                    boostListGrid.getSubGrid(
                                        {
                                            x: index + 1,
                                            y: 1,
                                            width: 1,
                                            height: 4,
                                            margin: {
                                                top: 40,
                                                bottom: 0,
                                                left: 30,
                                                right: 30,
                                            },
                                        },
                                        {
                                            division: {
                                                horizontal: 5,
                                                vertical: 4,
                                            },
                                        },
                                    ),
                                    index,
                                );
                            });

                            this.temporaryRoot.setVisible(true);
                            this.showReadyButton();
                        },
                        text: "Next Fight",
                    },
                ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 4),
            );
        }

        this.buttonsRoot.add(
            new Button(
                this.scene,
                this.buttonsGrid.getArea({
                    x: isVictory ? 6 : 4,
                    y: 1,
                    width: 3,
                    height: 1,
                }),
                {
                    onClick: () => {
                        console.log("Leave");
                        this.scene.root.controllers.game.disconnect();
                        MainMenu.start(this.scene, { keepMusic: false });
                    },
                    text: "Retour Menu",
                },
            ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 4),
        );
    }

    showReadyButton() {
        this.buttonsRoot.destroy();
        this.buttonsRoot.add(
            new Button(
                this.scene,
                this.buttonsGrid.getArea({
                    x: 4,
                    y: 1,
                    width: 3,
                    height: 1,
                }),
                {
                    onClick: () => {
                        console.log("ready");
                        this.onReady();
                    },
                    text: "Prêt",
                },
            )
                .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 4)
                .setIsActivated(!this.isReady),
        );
    }
}

