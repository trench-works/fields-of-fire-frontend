import { Socket } from "../../../core";

const USER_ID = "dev";
const GAME_TOPIC = "game";

type JoinGame = {
    gameId: string;
};

type JoinedGame = {
    game: { id: string };
    player: { id: string };
};

enum LobbyActions {
    JOIN = "join",
}

enum LobbyEvents {
    JOIN = "join",
}
/**
 * Game Defautl Socket (only for testing purpose, should be removed later)
 */

export class LobbySocket extends Socket<{}, LobbyActions, LobbyEvents> {
    constructor() {
        super(GAME_TOPIC);
        super.open(USER_ID);
    }

    onJoin(listener: (joinedGame: JoinedGame) => void) {
        this.on<JoinedGame>(LobbyEvents.JOIN, listener);
    }

    joinGame(joinGame: JoinGame) {
        return this.send<JoinGame>(LobbyActions.JOIN, joinGame);
    }
}

