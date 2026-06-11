import { Color } from "../../../config/ColorConfig";
import {
    BaseScene,
    CustomContainer,
    DisplayText,
    Grid,
    GridArea,
    PlacementOrigin,
} from "../../../core";

type LobbyInfos = {
    id: string;
    name: string;
    playersNum: number;
    maxPlayers: number;
    creator: string;
};
export class LobbyRow {
    private container: CustomContainer;
    private texts: Phaser.GameObjects.Text[] = [];

    public id: string;

    constructor(
        scene: BaseScene,
        area: GridArea,
        lobby: LobbyInfos,
        onClick: (row: LobbyRow) => void,
        isSelected: boolean = false,
    ) {
        this.id = lobby.id;
        this.container = new CustomContainer(
            scene,
            {
                x: area.center.x,
                y: area.center.y,
                width: area.width,
                height: area.height,
            },
            PlacementOrigin.CENTER,
            {
                opacity: 0.15,
                borderWidth: 1,
            },
        );

        this.container.setInteractive();
        this.container.on("pointerdown", () => onClick(this));

        // Sous-grille locale à la ligne

        this.buildCells(
            scene,
            lobby,
            area.getGrid({
                division: {
                    vertical: 1,
                    horizontal: 10,
                },
            }),
        );
        this.setSelected(isSelected);
    }

    private buildCells(scene: BaseScene, lobby: LobbyInfos, rowGrid: Grid) {
        new DisplayText(
            scene,
            rowGrid.getArea({
                x: 1,
                y: 1,
                width: 2,
                height: 1,
            }),
        ).setText(`Lobby : ${lobby.name}`);

        new DisplayText(
            scene,
            rowGrid.getArea({
                x: 4,
                y: 1,
                width: 1,
                height: 1,
            }),
        ).setText(`${lobby.playersNum}/${lobby.maxPlayers}`);

        new DisplayText(
            scene,
            rowGrid.getArea({
                x: 5,
                y: 1,
                width: 1,
                height: 1,
            }),
        ).setText(lobby.playersNum < lobby.maxPlayers ? "Open" : "Full", {
            color: lobby.playersNum < lobby.maxPlayers ? "#4ec64e" : "#c9443d",
        });

        new DisplayText(
            scene,
            rowGrid.getArea({
                x: 9,
                y: 1,
                width: 2,
                height: 1,
            }),
        ).setText(`Creator : ${lobby.creator}`);
    }

    public setSelected(selected: boolean) {
        this.container.setBackgroundColor(
            selected ? "#cc5316" : Color.containerBg,
            selected ? 0.5 : 0.15,
        );
    }

    public destroy() {
        this.container.destroy();
        this.texts.forEach((text) => text.destroy());
    }
}

