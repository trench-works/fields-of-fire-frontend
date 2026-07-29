import { Position } from "../../../core";
import { Case } from "../../../Model/Case";
import { Entity } from "../../../Model/Entity";
import { Game } from "../../../Model/Game";
import { Player } from "../../../Model/Player";
import { Team } from "../../../Model/Team";

export class GameStore {
    game!: Game;

    setGame(game: Game) {
        this.game = game;
    }

    getCell({ x, y }: Position): Case | undefined {
        return this.game?.plateau?.[x]?.[y];
    }

    getEntity(entityId: string): Entity {
        return this.game.entities.find((entity) => entity.id === entityId)!;
    }

    getPlayer(playerId: string): Player {
        return this.game.players.find((player) => player.id === playerId)!;
    }

    getTeam(teamId: string): Team {
        return this.game.teams.find((team) => team.id === teamId)!;
    }
}

