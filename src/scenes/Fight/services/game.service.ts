import { SoundEffectAsset, SoundEffectAssetId } from "../../../assets";
import { EventQueue, SoundEffect, Timeout } from "../../../core";
import { ConnectionLoader } from "../../../core/Objects/Loader";
import { Game } from "../../../Model/Game";
import { MainMenu } from "../../MainMenu/main-menu.scene";
import { ActionDisplayer } from "../display/action.displayer";
import { BoardDisplayer } from "../display/board.displayer";
import { CharactersDisplayer } from "../display/characters.displayer";
import { EndFightDisplayer } from "../display/end-fight.displayer";
import { StatsDisplayer } from "../display/stats.displayer";
import { TurnDisplayer } from "../display/turns.displayer";
import { FightSceneRoot } from "../fight-scene.root";
import { FightScene, FightSceneInit } from "../fight.scene";
import { ActionRepository } from "../repositories/action.repository";
import { ConnectingRepository } from "../repositories/connecting.repository";
import {
    GameRepository,
    GameUpdateEvent,
} from "../repositories/game.repository";
import { GamePlayerSocket } from "../repositories/player.socket";
import { ActionsService } from "../services/actions.service";
import { GameStore } from "../stores/game.store";
import { PlayerStore } from "../stores/player.store";
import { InspectCharacterService } from "./inspect-character.service";

export class GameService {
    constructor(
        private readonly root: FightSceneRoot,
        private readonly scene: FightScene,
        // Stores
        private readonly gameStore: GameStore,
        private readonly playerStore: PlayerStore,
        // Services
        private readonly gameUpdateQueue: EventQueue<GameUpdateEvent>,
        private readonly actionsService: ActionsService,
        private readonly inspectStatsService: InspectCharacterService,
        // Repositories
        private readonly connectingRepository: ConnectingRepository,
        private readonly gameRepository: GameRepository,
        private readonly actionRepository: ActionRepository,
        // Displayers
        private readonly board: BoardDisplayer,
        private readonly actions: ActionDisplayer,
        private readonly turns: TurnDisplayer,
        private readonly character: CharactersDisplayer,
        private readonly playerStats: StatsDisplayer,
        private readonly inspectStats: StatsDisplayer,
        private readonly endFight: EndFightDisplayer,
    ) {}

    readyForNewGame(boostId: string | null) {
        this.gameRepository.readyForNewGame(boostId);
    }

    init(data: FightSceneInit) {
        const {
            game,
            player: { id: playerId },
        } = data;
        this.gameStore.setGame(game);
        this.playerStore.setPlayerId(playerId);

        this.actions.preRender();
        this.board.preRender();
        this.turns.preRender();
        this.character.preRender();
        this.playerStats.preRender();
        this.inspectStats.preRender();
        this.endFight.preRender();

        this.root.playerSocket = new GamePlayerSocket(game.id, playerId);
        new ConnectionLoader(this.scene, this.connectingRepository);
        this.root.playerSocket.onClose(() =>
            MainMenu.start(this.scene, { keepMusic: false }),
        );
        this.gameRepository.onUpdate((event) =>
            this.gameUpdateQueue.add(event),
        );
        this.actionRepository.onActionCancel(() => {
            //TODO: afficher quelque part event.reason (peut être faire un mapping avec des messages plus clairs)
            this.actionsService.unlock();
        });
        this.gameRepository.onGameEnd(async (event) => {
            await this.gameUpdateQueue.waitForCompletion();
            if (event.playerWin) {
                new SoundEffect(
                    this.scene,
                    SoundEffectAsset.getAssetKey(SoundEffectAssetId.VICTORY),
                ).play();
            }
            //TODO: DISPLAY POPUP WIasync TH INFO event.playerWin (true|false)
            //this.playBackgroundMusic(MusicAssetId.MENU, true);
            this.endFight.show(event.playerWin, event.boosts);
        });

        this.gameRepository.onGameRenew(async (event) => {
            this.reset(event.data);
            this.endFight.reset();
        });
    }

    async reset(game: Game) {
        /**
         * Update Store
         */
        this.gameStore.setGame(game);
        this.playerStore.update();
        /**
         * Update Displayers
         */
        this.board.reset();
        this.actions.destroy().preRender().render().update();
        this.turns.update();
        this.character.render().update();
        this.playerStats
            .setEntity(this.playerStore.playerEntity)
            .setCharacterClass(this.playerStore.playerClass)
            .setName(user?.username ?? "NO_NAME")
            .update();
        if (this.inspectStats.isShow) {
            this.inspectStatsService.inspectCharacter(
                this.inspectStats.entityId,
            );
        }

        await Timeout(1000);
        this.actionsService.unlock();
    }

    create() {
        this.actions.render().update();
        this.board.render().update();
        this.character.render().update();
        this.turns.render();
        this.playerStats
            .setEntity(this.playerStore.playerEntity)
            .setCharacterClass(this.playerStore.playerClass)
            .setName(user?.username ?? "NO_NAME")
            .render()
            .update();
        this.inspectStats.render().setIsShow(false);
        this.endFight.render();
    }

    disconnect() {
        this.gameRepository.disconnect();
    }
}

