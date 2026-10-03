import { CharacterClass } from "../../../Model/CharacterClass";
import { Entity } from "../../../Model/Entity";
import { Player } from "../../../Model/Player";
import { ClassStore } from "./class.store";
import { GameStore } from "./game.store";

export class PlayerStore {
    playerId!: string;
    player!: Player;
    playerEntity!: Entity;
    playerClass!: CharacterClass;

    constructor(
        protected readonly classStore: ClassStore,
        protected readonly gameStore: GameStore,
    ) {}

    setPlayerId(playerId: string) {
        this.playerId = playerId;
        this.update();
    }

    update() {
        this.player = this.gameStore.game.players.find(
            (player) => player.id === this.playerId,
        )!;
        this.playerEntity = this.gameStore.game.entities.find(
            (entity) => entity.id === this.player.entityId,
        )!;
        this.playerClass = this.classStore.classes.find(
            (charClass) => charClass.id === this.playerEntity.classId,
        )!;
    }
}

