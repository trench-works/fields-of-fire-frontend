import { Color } from "../../../config/ColorConfig";
import {
    BaseScene,
    DisplayContainer,
    DisplayText,
    Grid,
    GridArea,
} from "../../../core";

type GameInfos = {
    id: string;
    name: string;
    playersNum: number;
};
export class GameRow {
    private container: DisplayContainer;
    private texts: DisplayText[] = [];

    public id: string;

    constructor(
        scene: BaseScene,
        area: GridArea,
        game: GameInfos,
        onClick: (row: GameRow) => void,
        isSelected: boolean = false,
    ) {
        this.id = game.id;
        this.container = new DisplayContainer(scene, area, {
            opacity: 0.15,
            borderWidth: 1,
            radius: 10,
            outterRadius: 10,
        });

        this.container.setInteractive();
        this.container.on("pointerdown", () => onClick(this));

        // Sous-grille locale à la ligne

        this.buildCells(
            scene,
            game,
            area.getGrid({
                division: {
                    vertical: 1,
                    horizontal: 10,
                },
                margin: 5,
            }),
        );
        this.setSelected(isSelected);
    }

    private buildCells(scene: BaseScene, lobby: GameInfos, rowGrid: Grid) {
        this.texts.push(
            new DisplayText(
                scene,
                rowGrid.getArea({
                    x: 1,
                    y: 1,
                    width: 9,
                    height: 1,
                }),
            ).setText(lobby.name),
        );

        this.texts.push(
            new DisplayText(
                scene,
                rowGrid.getArea({
                    x: 10,
                    y: 1,
                    width: 1,
                    height: 1,
                }),
            ).setText(`Players: ${lobby.playersNum}`),
        );
    }

    public setSelected(selected: boolean) {
        this.container.setBackgroundColor(
            selected ? Color.SELECTED_LOBBY : Color.MILITARY_SAND,
            selected ? 0.5 : 0.15,
        );
    }

    public destroy() {
        this.container.destroy();
        this.texts.forEach((text) => text.destroy());
    }
}

