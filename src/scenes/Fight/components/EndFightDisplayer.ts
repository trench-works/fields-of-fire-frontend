import { Button, CustomContainer, DisplayText, List } from "../../../core";
import { Game } from "../../../Model/Game";
import { FightScene } from "../fight.scene";
import { GameEventAnimation } from "../repositories/player.socket";
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

    protected blur!: CustomContainer;
    protected endGamePopup!: CustomContainer;
    protected endGamePopupTitle!: CustomContainer;
    protected titleText!: DisplayText;

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly playerStore: PlayerStore,
    ) {
        super(scene, gameStore );
    }

    preRender(): this {
        const blurArea = this.scene.rootGrid.getArea({
            x: 1,
            y: 1,
            width: 9,
            height: 9,
        });

        this.blur = new CustomContainer(this.scene, blurArea, {
            borderWidth: 6,
            opacity: 0.5,
        });

        const endGameArea = this.scene.rootGrid.getArea({
            x: 3,
            y: 3,
            width: 5,
            height: 3,
        });

        this.endGamePopup = new CustomContainer(this.scene, endGameArea, {
            borderWidth: 6,
            opacity: 1,
        });

        const titleEndgameGrid = endGameArea.getGrid();

        const titleEndgameArea= titleEndgameGrid.getArea({
            x: 3,
            y: 0,
            width: 5,
            height: 2,
        });

        this.endGamePopupTitle = new CustomContainer(this.scene, titleEndgameArea, {
            borderWidth: 6,
            opacity: 1,
        });

        this.titleText = new DisplayText(this.scene, titleEndgameArea)
        
        const entities = this.gameStore.game.entities;
        const rowCount = entities.length + 1; // +1 pour le header

        console.log("taille liste : " , endGameArea)
        
        const entityListGrid =  this.scene.rootGrid.getSubGrid(
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
        )
        //console.log('area : ', entityListGrid)
        const listArea = entityListGrid.getArea({
            x: 1,
            y: 1,
            width: 4, 
            height: 2,
            margin : { top : 50, bottom : 0, right:0, left:0}
        })

        

        this.entityList = new List(this.scene, entityListGrid);

        const testContainer  = new CustomContainer(this.scene, listArea, {
            borderWidth: 6,
            opacity: 1,
        });
        this.entityList.placeElement({ x: 0, y: 0 }, (area) =>
            new DisplayText(this.scene, {
                x: area.x - area.width / 2,
                y: area.y - area.height / 2,
                width: area.width,
                height: area.height,
            }).setText("Nom")
        );
        this.entityList.placeElement({ x: 1, y: 0 }, (area) =>
            new DisplayText(this.scene, {
                x: area.x - area.width / 2,
                y: area.y - area.height / 2,
                width: area.width,
                height: area.height,
            }).setText("Classe")
        );

    entities.forEach((entity, index) => {
        const iconObj = this.entityList.placeElement(
            { x: index, y: 0 },
            (area) => {
                return  new DisplayText(this.scene, {
                    x: area.x - area.width / 2,
                    y: area.y - area.height / 2,
                    width: area.width,
                    height: area.height,
                }).setText(entity.classId)
            },
        );
    });

        // --- Depths ---
        this.blur.setDepth(49);
        this.endGamePopup.setDepth(50);
        this.endGamePopupTitle.setDepth(51);
        this.titleText.setDepth(52);
        this.entityList.setDepth(53);
        testContainer.setDepth(54)

        return this;
    }

    render( ): this {
        return this;
    }

    update(): this {
        return this;
    }

    show(playerWin: boolean) {

        this.titleText.setText( playerWin ? "Victoire !" : "Défaite ")

    }

    async animate(): Promise<this> {
        return this;
    }
}