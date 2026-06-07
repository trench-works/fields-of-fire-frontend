import { Socket, SocketListener } from "../../../core";
import { Game } from "../../../Model/Game";

const MENU_TOPIC = "menu";

type JoinLobby = {
    lobbyId: string;
};

type JoinedLobby = {
    lobbyId: string;
    playerId: string;
};

type Reconnect = {
    game: Game;
    player: { playerId: string; classId: string };
};

enum LobbyActions {
    CREATE = "create",
    JOIN = "join",
}

enum LobbyEvents {
    JOIN = "join",
    RECONNECT = "reconnect",
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

