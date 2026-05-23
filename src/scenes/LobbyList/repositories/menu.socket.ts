import { Socket, SocketListener } from "../../../core";
import { Lobby } from "../interfaces/Lobby";

const USER_ID = "dev";
const MENU_TOPIC = "game";

type JoinLobby = {
    lobbyId: string;
};

type JoinedLobby = {
    lobbyId: string;
    playerId: string;
};

type Reconnect = {
    lobbyId?: string;
    gameId?: string;
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

export class MenuSocket extends Socket<{}, LobbyActions, LobbyEvents> {
    constructor() {
        super(MENU_TOPIC);
        super.open(USER_ID, {});
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

