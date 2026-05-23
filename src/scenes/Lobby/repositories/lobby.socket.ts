import { Socket, SocketListener } from "../../../core";
import { Game } from "../../../Model/Game";

const USER_ID = "dev";
const LOBBY_TOPIC = "lobby";

type LobbyKey = {
    lobbyId: string;
};

type ChangeClass = {
    classId: string;
};

type LobbyUpdated = {
    lobbyId: string;
    players: { playerId: string; classId: string; userId: string }[];
};

type GameStarted = {
    game: Game;
    player: { playerId: string };
};

enum LobbyActions {
    START = "start",
    LEAVE = "leave",
    CHANGE_CLASS = "change-class",
}

enum LobbyEvents {
    START = "start",
    UPDATE = "update",
}
/**
 * Game Defautl Socket (only for testing purpose, should be removed later)
 */

export class LobbySocket extends Socket<LobbyKey, LobbyActions, LobbyEvents> {
    constructor(lobbyId: string) {
        super(LOBBY_TOPIC);
        super.open(USER_ID, { lobbyId });
    }

    onStart(listener: SocketListener<GameStarted>) {
        this.on(LobbyEvents.START, listener);
    }

    onLobbyUpdate(listener: SocketListener<LobbyUpdated>) {
        this.on(LobbyEvents.UPDATE, listener);
    }

    leaveLobby() {
        return this.send(LobbyActions.LEAVE, {});
    }

    changeClass(changeClass: ChangeClass) {
        return this.send(LobbyActions.CHANGE_CLASS, changeClass);
    }

    startGame() {
        return this.send(LobbyActions.START, {});
    }
}

