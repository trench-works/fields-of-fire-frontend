import { FightSceneInit } from "../fight.scene";
import { GameService } from "../services/game.service";
import { InspectCharacterService } from "../services/inspect-character.service";

export class GameController {
    constructor(
        private readonly gameService: GameService,
        private readonly inspectService: InspectCharacterService,
    ) {}

    readyForNewGame = (boostId: string | null) => {
        this.gameService.readyForNewGame(boostId);
    };

    init = (data: FightSceneInit) => {
        this.gameService.init(data);
    };

    inspectCharacter = (entityId: string) => {
        this.inspectService.inspectCharacter(entityId);
    };

    create = () => {
        this.gameService.create();
    };

    disconnect = () => {
        this.gameService.disconnect();
    };
}

