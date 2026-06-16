import { CharacterCloseupAsset } from "../../../../assets";
import {
    Button,
    DisplayContainer,
    DisplayRoot,
    DisplayText,
    Grid,
    List,
} from "../../../../core";
import { DisplayImage } from "../../../../core/UI/DisplayImage";
import { Entity, EntityType } from "../../../../Model/Entity";
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

    protected root: DisplayRoot;

    protected titleText!: DisplayText;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly playerStore: PlayerStore,
    ) {
        super(scene, gameStore);
        this.root = new DisplayRoot();
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
                    },
                    text: "Next Fight",
                },
            ).setDepth(104),
        );
        this.root.add(
            new Button(
                this.scene,
                buttonsGrid.getArea({
                    x: 6,
                    y: 1,
                    width: 2,
                    height: 1,
                }),
                {
                    onClick: () => {
                        console.log("Leave");
                        // if (config.onMainMenuClick) {
                        //     config.onMainMenuClick();
                        // }
                    },
                    text: "Abandonner",
                },
            ).setDepth(104),
        );
        this.root.add(
            new DisplayContainer(
                this.scene,
                buttonsGrid.getArea({
                    x: 1,
                    y: 1,
                    width: 9,
                    height: 1,
                }),
                { borderWidth: 2, opacity: 0.3 },
            ).setDepth(104),
        );

        console.log("taille liste : ", endGameArea);

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
            const cardGrid = entityListGrid.getSubGrid(
                { x: index + 1, y: 1, width: 1, height: 6 },
                { division: { horizontal: 4, vertical: 3 } },
            );
            this.entityCard(entity, cardGrid, rowCount);
        });
        this.entityList.setDepth(103);

        this.root.setVisible(false);
        return this;
    }

    update(): this {
        return this;
    }

    show(playerWin: boolean) {
        //console.log("show called", this.root);
        this.titleText.setText(playerWin ? "Victoire !" : "Défaite ");
        this.root.setVisible(true);
    }

    async animate(): Promise<this> {
        return this;
    }

    entityCard(entity: Entity, entityListGrid: Grid, width: number): void {
        // Conteneur de la card
        this.root.add(
            new DisplayContainer(
                this.scene,
                entityListGrid.getArea({
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

        this.root.add(
            new DisplayImage(
                this.scene,
                entityListGrid.getArea({
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
        this.root.add(
            new DisplayText(
                this.scene,
                entityListGrid.getArea({
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
}

