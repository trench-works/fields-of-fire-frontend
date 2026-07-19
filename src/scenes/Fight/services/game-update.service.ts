import { Game } from "../../../Model/Game";
import { ActionDisplayer } from "../display/action.displayer";
import { BoardDisplayer } from "../display/board.displayer";
import { CharactersDisplayer } from "../display/characters.displayer";
import { StatsDisplayer } from "../display/stats.displayer";
import { TurnDisplayer } from "../display/turns.displayer";
import { GameEventAnimation } from "../repositories/game.repository";
import { ActionsService } from "./actions.service";
import { GameStore } from "../stores/game.store";
import { PlayerStore } from "../stores/player.store";
import { InspectCharacterService } from "./inspect-character.service";
import { AnimationService } from "./animation.service";
import { Timeout } from "../../../core";

export class GameUpdateService {
    constructor(
        // Stores
        private readonly gameStore: GameStore,
        private readonly playerStore: PlayerStore,
        // Services
        private readonly actionsService: ActionsService,
        private readonly inspectService: InspectCharacterService,
        private readonly animationService: AnimationService,
        // Displayers
        private readonly board: BoardDisplayer,
        private readonly actions: ActionDisplayer,
        private readonly turns: TurnDisplayer,
        private readonly character: CharactersDisplayer,
        private readonly playerStats: StatsDisplayer,
        private readonly inspectStats: StatsDisplayer,
    ) {}

    async handleUpdate(
        game: Game,
        animations: GameEventAnimation[],
    ): Promise<void> {
        /**
         * Do animations !!!!!
         */
        for (const animation of animations) {
            switch (animation.key) {
                case "move":
                    await this.character.animate(animation);
                    break;
                case "attack":
                    await this.animationService.animateAttack(animation);
                    break;
                case "death":
                    if (
                        animation.data.entityId === this.inspectStats.entityId
                    ) {
                        this.inspectStats.setIsShow(false);
                    }
                    if (
                        animation.data.entityId ===
                        this.playerStore.playerEntity.id
                    ) {
                        this.playerStats.blurOut();
                        this.actions.root.blur();
                    }
                    this.character.kill(animation.data.entityId);
                    break;
            }
        }

        /**
         * Update Store
         */
        this.gameStore.setGame(game);
        this.playerStore.update();
        /**
         * Update Displayers
         */
        this.board.update();
        this.actions.update();
        this.turns.update();
        this.character.update();
        this.playerStats
            .setEntity(this.playerStore.playerEntity)
            .setCharacterClass(this.playerStore.playerClass)
            .setName(user?.username ?? "NO_NAME")
            .update();
        if (this.inspectStats.isShow) {
            this.inspectService.inspectCharacter(this.inspectStats.entityId);
        }

        this.actionsService.unlock();
        await Timeout(1000);
    }
}

