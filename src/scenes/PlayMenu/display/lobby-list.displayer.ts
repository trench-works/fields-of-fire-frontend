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
import { LobbyListStore } from "../stores/lobby-list.store";

export class LobbyListDisplayer extends Displayer<PlayMenuScene> {
    private joinButton!: Button;
    private lobbyRows: LobbyRow[] = [];

    private rootGrid: Grid;

    constructor(
        scene: PlayMenuScene,
        private readonly lobbyStore: LobbyListStore,
    ) {
        super(scene);
        this.rootGrid = this.scene.rootGrid.getSubGrid({
            x: 2,
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
            translate("lobbyList.title"),
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

        new Button(
            this.scene,
            buttonGrid.getArea({ x: 2, y: 2, width: 5, height: 7 }),
            {
                text: translate("lobbyList.create"),
                onClick: () => {
                    this.scene.root.controllers.play.createLobby();
                },
            },
        );

        this.joinButton = new Button(
            this.scene,
            buttonGrid.getArea({ x: 8, y: 2, width: 5, height: 7 }),
            {
                text: translate("lobbyList.join"),
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
        if (!this.lobbyStore.selectedLobbyId) {
            this.joinButton.setIsActivated(false);
        }
        this.lobbyRows.forEach((row) => row.destroy()); // destroy all rows
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

        this.lobbyStore.lobbies.forEach((lobby, i) => {
            const rowArea = listGrid.getArea({
                x: 1,
                y: i + 1,
                width: 9,
                height: 1,
                margin: { right: 5, left: 5, top: 5, bottom: 0 },
            });
            this.lobbyRows.push(
                new LobbyRow(
                    this.scene,
                    rowArea,
                    {
                        id: lobby.id,
                        name: lobby.name,
                        creator: lobby.creator,
                        playersNum:
                            lobby.teams?.flatMap((team) => team.players)
                                ?.length ?? 0,
                        maxPlayers: lobby.maxPlayers,
                    },
                    () => {
                        this.joinButton.setIsActivated(true);
                        this.lobbyStore.setSelectedLobbyId(lobby.id);
                        this.lobbyRows.forEach((lobbyRow) => {
                            lobbyRow.setSelected(
                                lobbyRow.id === this.lobbyStore.selectedLobbyId,
                            );
                        });
                    },
                    lobby.id === this.lobbyStore.selectedLobbyId,
                ),
            );
        });
        return this;
    }
}

