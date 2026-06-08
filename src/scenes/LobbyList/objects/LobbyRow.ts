import { Color } from "../../../config/ColorConfig";
import { CustomContainer, Grid, GridArea } from "../../../core";
import { LobbyData } from "../interfaces/LobbyData";

// LobbyRow.ts
export class LobbyRow {
    private container: CustomContainer;
    private rowGrid: Grid;
    private texts: Phaser.GameObjects.Text[] = [];

    constructor(
        scene: Phaser.Scene,
        area: GridArea,
        lobby: LobbyData,
        onClick: (row: LobbyRow) => void,
    ) {
        this.container = new CustomContainer(scene, {
            title: "",
            x: area.center.x,
            y: area.center.y,
            width: area.width,
            height: area.height,
            opacity: 0.15,
            borderWidth: 1,
        });

        this.container.setInteractive();
        this.container.on("pointerdown", () => onClick(this));

        // Sous-grille locale à la ligne
        this.rowGrid = new Grid({
            size: {
                width: area.width,
                height: area.height,
            },
            division: {
                vertical: 10,
                horizontal: 1,
            },
            offset: {
                x: area.x,
                y: area.y,
            },
        });

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
                    nameCell.center.y,
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
                    playersCell.center.x,
                    playersCell.center.y,
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
                    creatorCell.center.x,
                    creatorCell.center.y,
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
                    statusCell.center.y,
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

