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
        this.rowGrid = area.getGrid({
            division: {
                vertical: 10,
                horizontal: 1,
            },
        });

        this.buildCells(scene, lobby);
    }

    private buildCells(scene: Phaser.Scene, lobby: LobbyData) {
        const nameCell = this.rowGrid.getArea({
            x: 1,
            y: 1,
            width: 4,
            height: 1,
        });
        const playersCell = this.rowGrid.getArea({
            x: 5,
            y: 1,
            width: 2,
            height: 1,
        });
        const creatorCell = this.rowGrid.getArea({
            x: 7,
            y: 1,
            width: 2,
            height: 1,
        });
        const statusCell = this.rowGrid.getArea({
            x: 9,
            y: 1,
            width: 2,
            height: 1,
        });

        this.texts.push(
            scene.add
                .text(
                    nameCell.x + 10,
                    nameCell.center.y + 20,
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
                    playersCell.center.y + 20,
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
                    creatorCell.center.y + 20,
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
                    statusCell.center.y + 20,
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

