import { Position, Socket } from "../../../core";

const USER_ID = "dev";
const LOBBY_TOPIC = "game";

type LobbyKey = {
    gameId: string;
};

type JoinGame = {
    gameId: string;
};

type JoinedGame = {
    game: {
        id: string;
        players: {
            playerId: string;
            userId: string;
            entityId: string;
            gameId: string;
        }[];
        entities: {
            entityId: string;
            characterClassId: string;
            position: Position;
        }[];
    };
    player: { playerId: string };
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

export class LobbySocket extends Socket<LobbyKey, LobbyActions, LobbyEvents> {
    constructor(gameId: string) {
        super(LOBBY_TOPIC);
        super.open(USER_ID, { gameId });
    }

    onJoin(listener: (joinedGame: JoinedGame) => void) {
        this.on<JoinedGame>(LobbyEvents.JOIN, listener);
    }

    joinGame(joinGame: JoinGame) {
        return this.send<JoinGame>(LobbyActions.JOIN, joinGame);
    }
}

