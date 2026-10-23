import {
    Button,
    DisplayContainer,
    Displayer,
    DisplayText,
    Grid,
} from "../../../core";
import { translate } from "../../../core/i18n/i18n";
import { LobbyRow } from "../objects/LobbyRow";
import { PlayMenuScene } from "../play-menu.scene";
import { GameListStore } from "../stores/game-list.store";

export class GameListDisplayer extends Displayer<PlayMenuScene> {
    private joinButton!: Button;
    private gameRows: LobbyRow[] = [];

    private rootGrid: Grid;

    constructor(
        scene: PlayMenuScene,
        private readonly gameStore: GameListStore,
    ) {
        super(scene);
        this.rootGrid = this.scene.rootGrid.getSubGrid({
            x: 1,
            y: 1,
            margin: { vertical: 0, horizontal: 10 },
        });
    }

    preRender(): this {
        //title BOX
        const titleBox = this.rootGrid.getArea({
            x: 1,
            y: 2,
            width: 9,
            height: 1,
        });
        new DisplayText(this.scene, titleBox).setText(
            translate("gamesList.title"),
        );

        //lobby list
        const lobbyListArea = this.rootGrid.getArea({
            x: 1,
            y: 3,
            width: 9,
            height: 6,
        });
        new DisplayContainer(this.scene, lobbyListArea, {
            opacity: 0.25,
            borderWidth: 2,
            radius: 10,
            outterRadius: 10,
        });
        //buttons

        const buttonGrid = this.rootGrid.getSubGrid(
            {
                x: 1,
                y: 9,
                width: 9,
                height: 1,
            },
            {
                division: {
                    vertical: 9,
                    horizontal: 13,
                },
            },
        );

        this.joinButton = new Button(
            this.scene,
            buttonGrid.getArea({ x: 4, y: 2, width: 6, height: 7 }),
            {
                text: translate("gamesList.join"),
                onClick: () => {
                    this.scene.root.controllers.play.joinLobby();
                },
            },
        ).setIsActivated(false);
        return this;
    }

    render(): this {
        return this;
    }

    update(): this {
        if (!this.gameStore.selectedGameId) {
            this.joinButton.setIsActivated(false);
        }
        this.gameRows.forEach((row) => row.destroy()); // destroy all rows
        const listGrid = this.rootGrid.getSubGrid(
            {
                x: 1,
                y: 3,
                width: 9,
                height: 6,
            },
            {
                division: {
                    vertical: 12,
                    horizontal: 9,
                },
            },
        );

        this.gameStore.games.forEach((game, i) => {
            const rowArea = listGrid.getArea({
                x: 1,
                y: i + 1,
                width: 9,
                height: 1,
                margin: { right: 5, left: 5, top: 5, bottom: 0 },
            });
            this.gameRows.push(
                new LobbyRow(
                    this.scene,
                    rowArea,
                    {
                        id: game.id,
                        name: game.name,
                        creator: "UNKNOWN CREATOR",
                        playersNum: -1,
                        maxPlayers: -1,
                    },
                    () => {
                        this.joinButton.setIsActivated(true);
                        this.gameStore.setSelectedGameId(game.id);
                        this.gameRows.forEach((gameRow) => {
                            gameRow.setSelected(
                                gameRow.id === this.gameStore.selectedGameId,
                            );
                        });
                    },
                    game.id === this.gameStore.selectedGameId,
                ),
            );
        });
        return this;
    }
}

