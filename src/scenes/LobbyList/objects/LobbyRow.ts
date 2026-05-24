import { Color } from "../../../config/ColorConfig";
import { CustomContainer, UiGrid, UiGridArea } from "../../../core";
import { uiGrid } from "../../../core/Utils/Grid";
import { LobbyData } from "../interfaces/LobbyData";

// LobbyRow.ts
export class LobbyRow {
    private container: CustomContainer;
    private rowGrid: UiGrid;
    private texts: Phaser.GameObjects.Text[] = [];

    constructor(
        scene: Phaser.Scene,
        area: UiGridArea,
        lobby: LobbyData,
        onClick: (row: LobbyRow) => void,
    ) {
        this.container = new CustomContainer(scene, {
            title: "",
            x: area.centerX,
            y: area.centerY,
            width: area.width,
            height: area.height,
            opacity: 0.15,
            borderWidth: 1,
        });

        this.container.setInteractive();
        this.container.on("pointerdown", () => onClick(this));

        // Sous-grille locale à la ligne
        this.rowGrid = uiGrid(
            0,
            0,
            area.width,
            area.height,
            10,
            1,
            area.x,
            area.y,
        );

        this.buildCells(scene, lobby);
    }

    private buildCells(scene: Phaser.Scene, lobby: LobbyData) {
        const nameCell = this.rowGrid.getArea(0, 0, 4, 1);
        const playersCell = this.rowGrid.getArea(4, 0, 2, 1);
        const creatorCell = this.rowGrid.getArea(6, 0, 2, 1);
        const statusCell = this.rowGrid.getArea(8, 0, 2, 1);

        this.texts.push(
            scene.add
                .text(
                    nameCell.x + 10,
                    nameCell.centerY,
                    `Lobby : ${lobby.id}`,
                    {
                        fontSize: "18px",
                        color: "#ffffff",
                    },
                )
                .setOrigin(0, 0.5),
        );

        this.texts.push(
            scene.add
                .text(
                    playersCell.centerX,
                    playersCell.centerY,
                    `${lobby.players.length}/${lobby.maxPlayers}`,
                    {
                        fontSize: "18px",
                        color: "#ffffff",
                    },
                )
                .setOrigin(0.5, 0.5),
        );

        this.texts.push(
            scene.add
                .text(
                    creatorCell.centerX,
                    creatorCell.centerY,
                    `Creator : ${lobby.creatorId}`,
                    {
                        fontSize: "18px",
                        color: "#ffffff",
                    },
                )
                .setOrigin(0.5, 0.5),
        );

        this.texts.push(
            scene.add
                .text(
                    statusCell.x + statusCell.width - 10,
                    statusCell.centerY,
                    lobby.players.length < lobby.maxPlayers ? "Open" : "Full",
                    {
                        fontSize: "18px",
                        color:
                            lobby.players.length < lobby.maxPlayers
                                ? "#4ec64e"
                                : "#c9443d",
                    },
                )
                .setOrigin(1, 0.5),
        );
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

