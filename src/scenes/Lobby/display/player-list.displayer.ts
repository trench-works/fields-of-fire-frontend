import { CharacterCloseupAsset, CharacterIconAsset } from "../../../assets";
import {
    BaseScene,
    Button,
    DisplayContainer,
    DisplayRoot,
    DisplayText,
    GridArea,
    ScaleMode,
} from "../../../core";
import { translate } from "../../../core/i18n/i18n";
import { DisplayImage } from "../../../core/UI/DisplayImage";
import { GameMode } from "../../../Model/Game";
import { TEAM_STRING_COLORS } from "../../../Model/Team";
import { LobbySocket } from "../repositories/lobby.socket";
import { LobbyStore } from "../stores/lobby.store";

export class PlayerListDisplayer {
    public isActive: boolean = false;

    public settingsRoot!: DisplayRoot;
    public settingsArea!: GridArea;

    constructor(
        private readonly scene: BaseScene,
        private readonly lobbyStore: LobbyStore,
        private readonly socket: LobbySocket,
    ) {
        this.update();
    }

    private displayPVPPlayers() {
        const maxTeamNb = 4;

        const teamsGrid = this.settingsArea.getGrid({
            division: { horizontal: maxTeamNb, vertical: 1 },
            padding: 10,
        });

        for (let i = 0; i < maxTeamNb; i++) {
            const teamArea = teamsGrid.getArea({
                x: i + 1,
                y: 1,
                width: 1,
                height: 1,
            });
            const team = this.lobbyStore.lobby?.teams[i];

            const teamGrid = teamArea.getGrid({
                division: { horizontal: 1, vertical: 5 },
            });

            if (team) {
                this.settingsRoot.add(
                    new DisplayContainer(this.scene, teamArea, {
                        borderWidth: 2,
                        bgColor: TEAM_STRING_COLORS[team.color],
                    }),
                );

                //affichage d'une team
                for (let j = 0; j < 4; j++) {
                    const player = team?.players?.[j];
                    const rowGrid = teamGrid.getSubGrid(
                        { x: 1, y: j + 1 },
                        {
                            division: { horizontal: 1, vertical: 3 },
                            padding: 5,
                        },
                    );

                    if (player) {
                        this.settingsRoot.add(
                            new DisplayImage(
                                this.scene,
                                rowGrid
                                    .getArea({ x: 1, y: 1, height: 3 })
                                    .scaleFromCenter(1, ScaleMode.FIT),
                            ).setImage(
                                CharacterIconAsset.getAssetKey(player.classId),
                            ),
                        );

                        this.settingsRoot.add(
                            new DisplayText(
                                this.scene,
                                rowGrid
                                    .getArea({ x: 1, y: 1 })
                                    .scaleFromCenter(1, ScaleMode.FIT),
                            ).setText(player.name),
                        );
                    } else {
                        this.settingsRoot.add(
                            new DisplayContainer(
                                this.scene,
                                rowGrid
                                    .getArea({ x: 1, y: 1, height: 3 })
                                    .scaleFromCenter(1, ScaleMode.FIT),
                                { borderWidth: 2 },
                            ),
                        );
                    }
                }
                this.settingsRoot.add(
                    new Button(
                        this.scene,
                        teamGrid.getArea({
                            x: 1,
                            y: 5,
                            width: 1,
                            height: 1,
                        }),
                        {
                            text: translate("lobby.joinTeam"),
                            borderWidth: 2,
                            onClick: () => this.socket.joinTeam(i),
                        },
                    ),
                );
            } else if (
                i === this.lobbyStore.lobby?.teams.length &&
                globalThis.user?.id === this.lobbyStore.lobby.creatorId
            ) {
                this.settingsRoot.add(
                    new Button(
                        this.scene,
                        teamGrid.getArea({
                            x: 1,
                            y: 1,
                            width: 1,
                            height: 1,
                        }),
                        {
                            text: `${translate("lobby.addTeam")} +`,
                            borderWidth: 2,
                            onClick: () => this.socket.addTeam(),
                        },
                    ),
                );
            }
        }
    }

    displayInfinityPlayers() {
        const players =
            this.lobbyStore.lobby?.teams?.flatMap((team) => team.players) ?? [];
        const listGrid = this.settingsArea.getGrid({
            division: { horizontal: 1, vertical: 4 },
            padding: 5,
        });

        players.forEach((player, index) => {
            const rowGrid = listGrid.getSubGrid(
                { x: 1, y: index + 1, width: 1, height: 1 },
                { division: { horizontal: 5, vertical: 1 } },
            );

            this.settingsRoot.add(
                new DisplayContainer(
                    this.scene,
                    rowGrid.getArea({ x: 1, y: 1 }),
                    {
                        backgroundImage: CharacterCloseupAsset.getAssetKey(
                            player.classId,
                        ),
                        borderWidth: 2,
                    },
                ),
            );

            this.settingsRoot.add(
                new DisplayText(
                    this.scene,
                    rowGrid.getArea({ x: 2, y: 1, width: 4, height: 1 }),
                ).setText(player.name ?? player.userId),
            );
        });
    }

    update() {
        if (!this.settingsRoot || !this.settingsArea) return;

        this.settingsRoot.destroy();

        if (this.lobbyStore.lobby?.mode === GameMode.INFINITY) {
            this.displayInfinityPlayers();
        } else {
            this.displayPVPPlayers();
        }

        this.settingsRoot.setVisible(this.isActive);
    }
}

