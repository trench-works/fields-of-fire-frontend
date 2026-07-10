import { SoundEffectAsset, SoundEffectAssetId } from "../../../assets";
import { EventQueue, SoundEffect, Timeout } from "../../../core";
import { ConnectionLoader } from "../../../core/Objects/Loader";
import { Game } from "../../../Model/Game";
import { MainMenu } from "../../MainMenu/main-menu.scene";
import { ActionDisplayer } from "../display/action.displayer";
import { AttackDisplayer } from "../display/attack.displayer";
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
    GameEventAnimation,
    GameRepository,
    GameUpdateEvent,
} from "../repositories/game.repository";
import { GamePlayerSocket } from "../repositories/player.socket";
import { ActionsService } from "../services/actions.service";
import { ClassStore } from "../stores/class.store";
import { GameStore } from "../stores/game.store";
import { PlayerStore } from "../stores/player.store";

export class GameController {
    constructor(
        private readonly root: FightSceneRoot,
        private readonly scene: FightScene,
        // Stores
        private readonly gameStore: GameStore,
        private readonly playerStore: PlayerStore,
        private readonly classStore: ClassStore,
        private readonly gameUpdateQueue: EventQueue<GameUpdateEvent>,
        // Services
        private readonly actionsService: ActionsService,
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
        private readonly attacks: AttackDisplayer,
        private readonly endFight: EndFightDisplayer,
    ) {}

    readyForNewGame = (boostId: string | null) => {
        this.gameRepository.readyForNewGame(boostId);
    };

    init = (data: FightSceneInit) => {
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
    };

    reset = async (game: Game) => {
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
            this.inspectCharacter(this.inspectStats.entityId);
        }

        await Timeout(1000);
        this.actionsService.unlock();
    };

    public inspectCharacter(entityId: string) {
        const entity = this.gameStore.getEntity(entityId);
        const charClass = this.classStore.getClass(entity.classId);
        this.inspectStats
            .setEntity(entity)
            .setCharacterClass(charClass)
            .setName(charClass.name.split(" ")[0])
            .update()
            .setIsShow(true);
    }

    handleUpdate = async (
        game: Game,
        animations: GameEventAnimation[],
    ): Promise<void> => {
        /**
         * Do animations !!!!!
         */
        for (const animation of animations) {
            switch (animation.key) {
                case "move":
                    await this.character.animate(animation, game);
                    break;
                case "attack":
                    await this.attacks.animate(animation);
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
            this.inspectCharacter(this.inspectStats.entityId);
        }

        this.actionsService.unlock();
    };

    create = () => {
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
    };

    disconnect = () => {
        this.gameRepository.disconnect();
    };
}

