import { BaseScene } from "../../../core";
import { Game } from "../../../Model/Game";
import { FightSceneInit } from "../fight.scene";
import { GameService } from "../services/game.service";
import { InspectCharacterService } from "../services/inspect-character.service";

export class GameController {
    constructor(
        private readonly scene: BaseScene,
        private readonly gameService: GameService,
        private readonly inspectService: InspectCharacterService,
    ) {
        this.scene.events.on("characterClicked", (entityId: string) => {
            this.inspectCharacter(entityId);
        });
    }

    readyForNewGame = (boostId: string | null) => {
        this.gameService.readyForNewGame(boostId);
    };

    init = (data: FightSceneInit) => {
        this.gameService.init(data);
    };

    reset = async (game: Game) => {
        this.gameService.reset(game);
    };

    inspectCharacter = (entityId: string) => {
        this.inspectService.inspectCharacter(entityId);
    };

    create() {
        this.gameService.create();
    }

    disconnect = () => {
        this.gameService.disconnect();
    };
}

