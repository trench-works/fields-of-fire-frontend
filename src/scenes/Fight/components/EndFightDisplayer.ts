import {
    Button,
    CustomContainer,
    DisplayRoot,
    DisplayText,
    List,
} from "../../../core";
import { FightScene } from "../fight.scene";
import { GameStore } from "../stores/GameStore";
import { PlayerStore } from "../stores/PlayerStore";
import { FightSceneDisplayer } from "./FightSceneDisplayer";

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
            new CustomContainer(
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
            new CustomContainer(this.scene, endGameArea, {
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
            new CustomContainer(this.scene, titleEndgameArea, {
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
                    vertical: 2,
                },
                padding: 5,
            },
        );
        //console.log('area : ', entityListGrid)
        this.entityList = new List(this.scene, entityListGrid);

        this.root.add(
            new CustomContainer(
                this.scene,
                entityListGrid.getArea({
                    x: 1,
                    y: 1,
                    width: 4,
                    height: 2,
                    margin: { top: 50, bottom: 0, right: 0, left: 0 },
                }),
                {
                    borderWidth: 6,
                    opacity: 1,
                },
            ).setDepth(54),
        );
        this.root.add(
            this.entityList.placeElement({ x: 0, y: 0 }, (area) =>
                new DisplayText(this.scene, {
                    x: area.x - area.width / 2,
                    y: area.y - area.height / 2,
                    width: area.width,
                    height: area.height,
                }).setText("Nom"),
            ),
        );
        this.root.add(
            this.entityList.placeElement({ x: 1, y: 0 }, (area) =>
                new DisplayText(this.scene, {
                    x: area.x - area.width / 2,
                    y: area.y - area.height / 2,
                    width: area.width,
                    height: area.height,
                }).setText("Classe"),
            ),
        );

        entities.forEach((entity, index) => {
            const iconObj = this.entityList.placeElement(
                { x: index, y: 0 },
                (area) => {
                    return new DisplayText(this.scene, {
                        x: area.x - area.width / 2,
                        y: area.y - area.height / 2,
                        width: area.width,
                        height: area.height,
                    }).setText(entity.classId);
                },
            );
            this.root.add(iconObj);
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
}

