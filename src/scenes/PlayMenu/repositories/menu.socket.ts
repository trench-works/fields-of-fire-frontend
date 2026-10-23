import { Socket, SocketListener } from "../../../core";
import { Game } from "../../../Model/Game";
import { LobbyData } from "../interfaces/LobbyData";

const MENU_TOPIC = "menu";

type JoinLobby = {
    lobbyId: string;
};

type JoinedLobby = {
    lobby: LobbyData;
};

type Reconnect = {
    game: Game;
    player: { id: string; classId: string };
};

export type Update = {
    lobbies: LobbyData[];
};

enum LobbyActions {
    CREATE = "create",
    JOIN = "join",
}

enum LobbyEvents {
    JOIN = "join",
    RECONNECT = "reconnect",
    UPDATE = "update",
}
/**
 * Game Defautl Socket (only for testing purpose, should be removed later)
 */

export class MenuSocket extends Socket<object, LobbyActions, LobbyEvents> {
    constructor() {
        super(MENU_TOPIC);
        super.open({});
    }

    onJoin(listener: SocketListener<JoinedLobby>) {
        this.on(LobbyEvents.JOIN, listener);
    }

    onUpdate(listener: SocketListener<Update>) {
        this.on(LobbyEvents.UPDATE, listener);
    }

    onReconnect(listener: SocketListener<Reconnect>) {
        this.on(LobbyEvents.RECONNECT, listener);
    }

    createLobby() {
        return this.send(LobbyActions.CREATE, {});
    }

    joinLobby(joinLobby: JoinLobby) {
        return this.send(LobbyActions.JOIN, joinLobby);
    }
}

