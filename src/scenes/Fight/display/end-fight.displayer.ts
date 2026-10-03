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
import { translate, translateWildcard } from "../../../core/i18n/i18n";
import { DisplayImage } from "../../../core/UI/DisplayImage";
import { Boost } from "../../../Model/Boost";
import { Entity } from "../../../Model/Entity";
import { GameMode } from "../../../Model/Game";
import { Player } from "../../../Model/Player";
import { MainMenu } from "../../MainMenu/main-menu.scene";
import { FightScene } from "../fight.scene";
import { EndFightStore } from "../stores/end-fight.store";
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

    protected root: DisplayRoot;
    protected temporaryRoot: DisplayRoot;
    protected buttonsRoot: DisplayRoot;

    protected titleText!: DisplayText;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly playerStore: PlayerStore,
        private readonly endFightStore: EndFightStore,
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

        this.titleText = new DisplayText(this.scene, titleEndgameArea).setDepth(
            Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 2,
        );
        this.root.add(this.titleText);

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
        this.entityList = new List(this.scene, entityListGrid).setDepth(
            Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 3,
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
                this.gameStore.game.players.find(
                    (player) => player.entityId === entity.id,
                ),
            );
        });

        this.root.setVisible(false);
        this.temporaryRoot.setVisible(false);

        if (this.gameStore.game.isStopped) {
            this.show(
                this.gameStore.game.winnerTeamId ===
                    this.playerStore.player.teamId,
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
        this.endFightStore.boosts = boosts;
        this.endFightStore.isReady = this.gameStore.game.readyPlayers.includes(
            this.playerStore.player.id,
        );

        this.buttonsRoot.destroy();
        this.buttonsRoot = new DisplayRoot();

        this.temporaryRoot.destroy();
        this.temporaryRoot = new DisplayRoot();

        this.titleText.setText(
            playerWin
                ? `${translate("fight.end.victory")} !`
                : `${translate("fight.end.defeat")} `,
        );
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
                this.gameStore.game.players.find(
                    (player) => player.entityId === entity.id,
                ),
            );
        });
    }

    onBoostClick(boostId: string, card: DisplayContainer) {
        this.endFightStore.boostId = boostId;

        if (this.selectedBoostCard) {
            this.selectedBoostCard.setBackgroundColor(Color.MILITARY_GREEN);
        }

        card.setBackgroundColor(Color.CURRENT_TURN_BORDER);
        this.selectedBoostCard = card;
    }

    onReady() {
        if (!this.endFightStore.isReady) {
            this.endFightStore.isReady = true;
            this.scene.root.controllers.game.readyForNewGame(
                this.endFightStore.boostId,
            );
        }
        this.temporaryRoot.destroy();
    }

    async animate(): Promise<this> {
        return this;
    }

    displayEntityCard(entity: Entity, grid: Grid, player?: Player): void {
        const cardArea = grid.getArea({
            x: 1,
            y: 1,
            width: 3,
            height: 4,
            margin: { top: 50, bottom: 0, right: 0, left: 0 },
        });
        const cardGrid = cardArea.getGrid({ padding: 10 });
        // Conteneur de la card
        this.temporaryRoot.add(
            new DisplayContainer(this.scene, cardArea, {
                borderWidth: 3,
                opacity: 1,
                bgColor:
                    entity.teamId === this.playerStore.playerEntity.teamId
                        ? Color.SELF_TEAM
                        : Color.OTHER_TEAM,
            }).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 1),
        );

        this.temporaryRoot.add(
            new DisplayImage(
                this.scene,
                cardGrid
                    .getArea({
                        x: 4,
                        y: 1,
                        width: 3,
                        height: 3,
                    })
                    .scaleFromCenter(1, ScaleMode.FIT),
            )
                .setImage(CharacterCloseupAsset.getAssetKey(entity.classId))
                .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 2),
        );

        // Nom (ligne 3)
        this.temporaryRoot.add(
            new DisplayText(
                this.scene,
                cardGrid.getArea({
                    x: 3,
                    y: 4,
                    width: 5,
                    height: 2,
                }),
            )
                .setText(player?.name ?? entity.classId)
                .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 6),
        );

        if (player) {
            let i = 0;
            for (const [name, value] of Object.entries(player.stats)) {
                const x = i % 2;
                const y = Math.floor(i / 2);
                this.temporaryRoot.add(
                    new DisplayText(
                        this.scene,
                        cardGrid.getArea({
                            x: 2 + x * 4,
                            y: 6 + y,
                            width: 3,
                            height: 1,
                        }),
                    )
                        .setText(
                            `${translateWildcard(`fight.end.stats.${name}`)} : ${value}`,
                        )
                        .setDepth(
                            Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 6,
                        ),
                );
                i++;
            }
        }
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
                bgColor: Color.MILITARY_GREEN,
                onClick: () => this.onBoostClick(boost.id, boostCard),
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

        if (this.gameStore.game.mode === GameMode.INFINITY && isVictory) {
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
                            this.temporaryRoot.destroy();
                            const boostListGrid =
                                this.scene.rootGrid.getSubGrid(
                                    { x: 2, y: 2, width: 7, height: 5 },
                                    {
                                        division: {
                                            horizontal:
                                                this.endFightStore.boosts
                                                    .length,
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

                            this.endFightStore.boosts.forEach(
                                (boost, index) => {
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
                                },
                            );

                            this.temporaryRoot.setVisible(true);
                            this.showReadyButton();
                        },
                        text: translate("fight.end.nextFight"),
                    },
                ).setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 4),
            );
        }

        this.buttonsRoot.add(
            new Button(
                this.scene,
                this.buttonsGrid.getArea({
                    x:
                        this.gameStore.game.mode === GameMode.INFINITY &&
                        isVictory
                            ? 6
                            : 4,
                    y: 1,
                    width: 3,
                    height: 1,
                }),
                {
                    onClick: () => {
                        this.scene.root.controllers.game.disconnect();
                        MainMenu.start(this.scene, { keepMusic: false });
                    },
                    text: translate("fight.end.leave"),
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
                    onClick: () => this.onReady(),
                    text: translate("fight.end.ready"),
                },
            )
                .setDepth(Depth.getUIElementDepth(UI_LEVELS_OFFSET.POPUP) + 4)
                .setIsActivated(!this.endFightStore.isReady),
        );
    }
}

