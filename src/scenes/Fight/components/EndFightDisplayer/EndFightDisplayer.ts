import { CharacterCloseupAsset } from "../../../../assets";
import { EffectAsset, EffectAssetId } from "../../../../assets/EffectAsset";
import { Color } from "../../../../config/ColorConfig";
import {
    Button,
    DisplayContainer,
    DisplayRoot,
    DisplayText,
    Grid,
    List,
} from "../../../../core";
import { DisplayImage } from "../../../../core/UI/DisplayImage";
import { Boost } from "../../../../Model/Boost";
import { Entity, EntityType } from "../../../../Model/Entity";
import { MainMenu } from "../../../MainMenu/main-menu.scene";
import { FightScene } from "../../fight.scene";
import { GameStore } from "../../stores/GameStore";
import { PlayerStore } from "../../stores/PlayerStore";
import { FightSceneDisplayer } from "../FightSceneDisplayer";

export class EndFightDisplayer extends FightSceneDisplayer {
    /**
     * Displayed Elements
     */
    protected actionElements: Map<string, Button> = new Map();
    protected endTurnButton!: Button;
    protected actionsList!: List;
    protected entityList!: List;

    protected boostId!: string;
    protected boosts!: Boost[];

    protected root: DisplayRoot;
    protected temporaryRoot: DisplayRoot;

    protected titleText!: DisplayText;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly playerStore: PlayerStore,
    ) {
        super(scene, gameStore);
        this.root = new DisplayRoot();
        this.temporaryRoot = new DisplayRoot();
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
            ).setDepth(99),
        );

        const endGameArea = this.scene.rootGrid.getArea({
            x: 3,
            y: 3,
            width: 5,
            height: 4,
        });

        this.root.add(
            new DisplayContainer(this.scene, endGameArea, {
                borderWidth: 6,
                opacity: 1,
            }).setDepth(100),
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
            }).setDepth(101),
        );

        this.titleText = new DisplayText(this.scene, titleEndgameArea);
        this.root.add(this.titleText);

        // --- Depths ---
        this.titleText.setDepth(102);

        this.root.setVisible(false);

        return this;
    }

    render(): this {
        const entities = this.gameStore.game.entities;
        const rowCount = entities.length;

        const entityListGrid = this.scene.rootGrid.getSubGrid(
            {
                x: 3,
                y: 3,
                width: 5,
                height: 3,
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
            },
        );
        this.entityList = new List(this.scene, entityListGrid);
        entities.forEach((entity, index) => {
            this.displayeEntityCard(
                entity,
                entityListGrid.getSubGrid(
                    {
                        x: index + 1,
                        y: 1,
                        width: 1,
                        height: 6,
                        margin: { vertical: 0, horizontal: 40 },
                    },
                    {
                        division: { horizontal: 3, vertical: 3 },
                    },
                ),
                rowCount,
            );
        });
        this.entityList.setDepth(103);

        this.root.setVisible(false);
        this.temporaryRoot.setVisible(false);

        return this;
    }

    update(): this {
        return this;
    }

    reset(): this {
        this.root.setVisible(false);
        this.temporaryRoot.setVisible(false);
        this.showButtons(false);
        return this;
    }

    show(playerWin: boolean, boosts: Boost[]) {
        this.boosts = boosts;
        //console.log("show called", this.root);
        this.titleText.setText(playerWin ? "Victoire !" : "Défaite ");
        this.showButtons(playerWin ? true : false);
        this.root.setVisible(true);
        this.temporaryRoot.setVisible(true);
    }

    onBoostClick(boostId: string) {
        this.boostId = boostId;
    }

    onReady() {
        this.scene.playerSocket.readyForNewGame(this.boostId);
    }

    async animate(): Promise<this> {
        return this;
    }

    displayeEntityCard(
        entity: Entity,
        ObjectListGrid: Grid,
        width: number,
    ): void {
        // Conteneur de la card
        this.temporaryRoot.add(
            new DisplayContainer(
                this.scene,
                ObjectListGrid.getArea({
                    x: 1,
                    y: 1,
                    width: width,
                    height: 4,
                    margin: { top: 50, bottom: 0, right: 0, left: 0 },
                }),
                {
                    borderWidth: 3,
                    opacity: 1,
                    bgColor:
                        entity.entityType === EntityType.ALLY
                            ? "#396645"
                            : "#6e3822",
                },
            ).setDepth(100),
        );

        this.temporaryRoot.add(
            new DisplayImage(
                this.scene,
                ObjectListGrid.getArea({
                    x: 2,
                    y: 1,
                    width: 1,
                    height: 3,
                }),
            )
                .setImage(CharacterCloseupAsset.getAssetKey(entity.classId), 1)
                .setDepth(101),
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
                .setDepth(106),
        );
    }

    displayBoostCard(boost: Boost, entityListGrid: Grid): void {
        // Conteneur de la card
        this.temporaryRoot.add(
            new DisplayContainer(
                this.scene,
                entityListGrid.getArea({
                    x: 1,
                    y: 1,
                    width: 5,
                    height: 4,
                    margin: { top: 10, bottom: 10, right: 10, left: 10 },
                }),
                {
                    borderWidth: 3,
                    opacity: 1,
                    bgColor: Color.btnBg,
                    onClick: () => {
                        this.onBoostClick(boost.id);
                        this.onReady();
                        //TODO: FIXME: maybe change logic, first one is for select, second one is sending event to back
                    },
                },
            ).setDepth(100),
        );

        // Image (ligne 1)
        this.temporaryRoot.add(
            new DisplayImage(
                this.scene,
                entityListGrid.getArea({
                    x: 3,
                    y: 1,
                    width: 1,
                    height: 1,
                    margin: { top: 10, bottom: -8, left: 0, right: 0 },
                }),
            )
                .setImage(EffectAsset.getAssetKey(boost.id as EffectAssetId)) //TODO: pas bon ca un boost pas forcément = un effet, potentiellement plusieurs effets
                .setDepth(101),
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
                    onClick: () => this.onBoostClick(boost.id),
                },
            ).setDepth(100),
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
                .setDepth(101),
        );

        // Modifiers non nuls (ligne 3)
        const nonZeroStats = Object.entries(boost.boosts[0])
            .filter(([, value]) => value !== 0)
            .map(([key, value]) => `${key}: ${value > 0 ? "+" : ""}${value}`)
            .join("\n");

        if (nonZeroStats) {
            this.temporaryRoot.add(
                new DisplayText(
                    this.scene,
                    entityListGrid.getArea({ x: 2, y: 3, width: 3, height: 1 }),
                )
                    .setText(nonZeroStats)
                    .setDepth(101),
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
                    .setDepth(101),
            );
        }
    }

    showButtons(isVictory: boolean) {
        const buttonsGrid = this.scene.rootGrid.getSubGrid(
            {
                x: 3,
                y: 6,
                width: 5,
                height: 1,
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
            this.root.add(
                new Button(
                    this.scene,
                    buttonsGrid.getArea({
                        x: 3,
                        y: 1,
                        width: 2,
                        height: 1,
                    }),
                    {
                        onClick: () => {
                            console.log("nextRound");
                            this.temporaryRoot.destroy();
                            const boostListGrid =
                                this.scene.rootGrid.getSubGrid(
                                    { x: 3, y: 3, width: 5, height: 3 },
                                    {
                                        division: {
                                            horizontal: this.boosts.length,
                                            vertical: 4,
                                        },
                                        margin: {
                                            top: 20,
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
                                );
                            });

                            this.temporaryRoot.setVisible(true);
                        },
                        text: "Next Fight",
                    },
                ).setDepth(104),
            );
        }

        this.root.add(
            new Button(
                this.scene,
                buttonsGrid.getArea({
                    x: isVictory ? 6 : 4.5,
                    y: 1,
                    width: 2,
                    height: 1,
                }),
                {
                    onClick: () => {
                        console.log("Leave");
                        MainMenu.start(this.scene, { keepMusic: false });
                    },
                    text: "Retour Menu",
                },
            ).setDepth(104),
        );
    }
}

