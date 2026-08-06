import { Socket, SocketListener } from "../../../core";
import { Game } from "../../../Model/Game";
import { LobbyData } from "../../LobbyList/interfaces/LobbyData";

const LOBBY_TOPIC = "lobby";

type LobbyKey = {
    lobbyId: string;
};

type ChangeClass = {
    classId: string;
};

type PlayerReady = {
    playerId: string;
};

type LobbyUpdated = {
    lobby: LobbyData;
};

type GameStarted = Game;

enum LobbyActions {
    START = "start",
    LEAVE = "leave",
    CHANGE_CLASS = "change-class",
    UPDATE = "update",
    READY = "ready",
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
        super.open({ lobbyId });
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

    setPlayerReady(playerReady: PlayerReady) {
        return this.send(LobbyActions.READY, playerReady);
    }

    startGame() {
        return this.send(LobbyActions.START, {});
    }

    updateLobby(lobby: LobbyData) {
        return this.send(LobbyActions.UPDATE, {
            mode: lobby.mode,
            boardSize: lobby.boardSize,
        });
    }
}

