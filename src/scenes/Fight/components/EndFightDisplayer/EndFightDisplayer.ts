import { CharacterAssetId } from "../../../../assets";
import {
    Button,
    DisplayContainer,
    DisplayRoot,
    DisplayText,
    Grid,
    GridArea,
    List,
} from "../../../../core";
import { DisplayImage } from "../../../../core/UI/DisplayImage";
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
            ).setDepth(49),
        );

        const endGameArea = this.scene.rootGrid.getArea({
            x: 3,
            y: 3,
            width: 5,
            height: 3,
        });

        this.root.add(
            new DisplayContainer(this.scene, endGameArea, {
                borderWidth: 6,
                opacity: 1,
            }).setDepth(50),
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
            }).setDepth(51),
        );

        this.titleText = new DisplayText(this.scene, titleEndgameArea);
        this.root.add(this.titleText);

        const entities = this.gameStore.game.entities;
        const rowCount = entities.length + 1; // +1 pour le header

        console.log("taille liste : ", endGameArea);

        const entityListGrid = this.scene.rootGrid.getSubGrid(
            {
                x: 3,
                y: 3,
                width: 5,
                height: 1,
            },
            {
                division: {
                    horizontal: rowCount,
                    vertical: 4,
                },
                padding: 10,
            },
        );
        this.entityList = new List(this.scene, entityListGrid);

        entities.forEach((entity, index) => {
            const cardGrid = entityListGrid.getSubGrid(
                { x: index + 1, y: 1, width: 1, height: 1 },
                { division: { horizontal: 4, vertical: 3 } },
            );

            this.entityCard(
                entity.entityId,
                entity.entityId,
                cardGrid,
            );
        });

        // --- Depths ---
        this.titleText.setDepth(52);
        this.entityList.setDepth(53);

        this.root.setVisible(false);

        return this;
    }

    render(): this {
        return this;
    }

    update(): this {
        return this;
    }

    show(playerWin: boolean) {
        this.titleText.setText(playerWin ? "Victoire !" : "Défaite ");
        this.root.setVisible(true);
    }

    async animate(): Promise<this> {
        return this;
    }

    entityCard(entityName: string, imageKey: string, entityListGrid: Grid): void {

        // Conteneur de la card
        this.root.add(
            new DisplayContainer(
                this.scene,
                entityListGrid.getArea({
                    x: 1,
                    y: 1,
                    width: 4,
                    height: 2,
                    margin: { top: 50, bottom: 0, right: 0, left: 0 },
                }),
                { borderWidth: 3, opacity: 0.8 },
            ).setDepth(55),
        );

        // Image (lignes 1-2)
        const imageArea = entityListGrid.getArea({ x: 1, y: 1, width: 1, height: 2 });
        this.root.add(
            new DisplayImage(this.scene, imageArea)
                .setImage(imageKey, 1)
                .setDepth(56),
        );

        // Nom (ligne 3)
        const nameArea = entityListGrid.getArea({ x: 1, y: 3, width: 1, height: 1 });
        this.root.add(
            new DisplayText(this.scene, nameArea)
                .setText(entityName)
                .setDepth(56),
        );
    }
}