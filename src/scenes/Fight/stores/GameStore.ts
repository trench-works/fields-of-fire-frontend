import { Entity } from "../../../Model/Entity";
import { Game } from "../../../Model/Game";
import { Player } from "../../../Model/Player";

export class GameStore {
    game!: Game;

    setGame(game: Game) {
        this.game = game;
    }

    getEntity(entityId: string): Entity {
        return this.game.entities.find(
            (entity) => entity.entityId === entityId,
        )!;
    }

    getPlayer(playerId: string): Player {
        return this.game.players.find(
            (player) => player.playerId === playerId,
        )!;
    }
}

