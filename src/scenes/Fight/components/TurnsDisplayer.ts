import { CharacterCloseupAsset } from "../../../assets";
import { Color } from "../../../config/ColorConfig";
import { CustomContainer, GridUtils } from "../../../core";
import { FightScene } from "../fight.scene";
import { ClassStore } from "../stores/ClassStore";
import { GameStore } from "../stores/GameStore";
import { FightSceneDisplayer } from "./FightSceneDisplayer";

export class TurnDisplayer extends FightSceneDisplayer {
    private turnPanel!: CustomContainer;

    private icons: CustomContainer[] = [];

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly classStore: ClassStore,
    ) {
        super(scene, gameStore);
    }

    preRender(): this {
        const turndisplay = this.scene.sceneGrid.getArea(0, 0, 6, 2);
        this.turnPanel = new CustomContainer(this.scene, {
            title: "",
            x: turndisplay.x + turndisplay.width / 2,
            y: turndisplay.y + turndisplay.height / 2,
            width: turndisplay.width,
            height: turndisplay.height,
            opacity: 0.25,
        });

        this.turnPanel.setDepth(0);

        return this;
    }

    render(): this {
        const actualTurnCellH = 7;
        const turnCellH = 5;
        const turnCellW = 4;

        const otherCellW = turnCellW * 0.75;
        const otherStartCol = turnCellW + 1;

        const turnGrid = GridUtils.uiGrid(
            0,
            0,
            this.turnPanel.width,
            this.turnPanel.height,
            this.gameStore.game.playerTurns.length * 10,
            9,
        );

        const firstCell = turnGrid.getArea(1, 1, turnCellW, actualTurnCellH);

        this.gameStore.game.playerTurns.forEach((entityId, index) => {
            const entity = this.gameStore.game.entities.find(
                (entity) => entity.entityId === entityId,
            )!;
            const player = this.gameStore.game.players.find(
                (player) => player.entityId === entityId,
            );
            const charClass = this.classStore.classes.find(
                (charClass) => charClass.id === entity?.classId,
            );
            const isFirstCell = index === 0;

            const col = otherStartCol + (index - 1) * (otherCellW + 1);
            const otherCell = turnGrid.getArea(col, 1, otherCellW, turnCellH);

            this.icons.push(
                new CustomContainer(this.scene, {
                    title: player?.name ?? charClass?.name?.split(" ")[0] ?? "",
                    x:
                        this.turnPanel.x -
                        this.turnPanel.width / 2 +
                        (isFirstCell ? firstCell : otherCell).centerX +
                        (isFirstCell ? 0 : 50),
                    y:
                        this.turnPanel.y -
                        this.turnPanel.height / 2 +
                        (isFirstCell ? firstCell : otherCell).centerY,
                    width: (isFirstCell ? firstCell : otherCell).width,
                    height: (isFirstCell ? firstCell : otherCell).height,
                    borderWidth: isFirstCell ? 5 : 2,
                    borderColor: isFirstCell
                        ? Color.actualTurnBorder
                        : Color.otherTurnBorder,
                    backgroundImage: CharacterCloseupAsset.getAssetKey(
                        entity.classId,
                    ),
                    opacity: isFirstCell ? 1 : 0.7,
                }),
            );
        });
        return this;
    }

    update(): this {
        this.icons.forEach((icon) => icon.destroy());
        this.icons = [];
        return this.render();
    }

    async animate(): Promise<this> {
        return this;
    }
}

