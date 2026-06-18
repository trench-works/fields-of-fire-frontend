import { FightScene } from "../../fight.scene";
import { Character } from "./Character";
import { GameStore } from "../../stores/GameStore";
import { FightSceneDisplayer } from "../FightSceneDisplayer";
import { GameMoveAnimation } from "../../repositories/player.socket";
import { Game } from "../../../../Model/Game";
import { Position, SoundEffect } from "../../../../core";
import { SoundEffectAsset, SoundEffectAssetId } from "../../../../assets";
import { PlayerStore } from "../../stores/PlayerStore";
import { PositionUtils } from "../../../../core/Utils/Sizing";

export class CharactersDisplayer extends FightSceneDisplayer {
    characters: Character[] = [];

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        protected readonly playerStore: PlayerStore,
    ) {
        super(scene, gameStore);
    }

    preRender(): this {
        return this;
    }

    render(): this {
        this.characters.forEach((character) => character.destroy());
        this.characters = this.gameStore.game.entities
            .filter((entity) => !entity.dead)
            .map((entity) =>
                new Character(this.scene, this.gameStore, entity.entityId)
                    .preRender()
                    .render(),
            );
        return this;
    }

    update(): this {
        for (const character of this.characters) {
            character.update();
        }
        return this;
    }

    async kill(entityId: string): Promise<this> {
        return new Promise((resolve) => {
            const i = this.characters.findIndex(
                (character) => character.entityId === entityId,
            );
            if (i >= 0) {
                const character = this.characters[i];
                this.characters.splice(i, 1);
                new SoundEffect(
                    this.scene,
                    SoundEffectAsset.getAssetKey(SoundEffectAssetId.DEATH),
                ).play();
                character.destroy();
            }
            setTimeout(() => resolve(this), 1000);
        });
    }

    async scope(entityId: string, time: number) {
        await this.characters
            .find((character) => character.entityId === entityId)
            ?.scope(time);
    }

    changeDirection(target: Position, entityId?: string) {
        entityId ??= this.playerStore.playerEntity.entityId;
        const character = this.characters.find(
            (character) => character.entityId === entityId,
        );
        if (character) {
            const currentPosition = this.gameStore.getEntity(entityId).position;
            if (!PositionUtils.equals(currentPosition, target)) {
                character.changeDirection(
                    this.gameStore.getEntity(entityId).position,
                    target,
                );
            }
        }
    }

    async animate(animation: GameMoveAnimation, newGame: Game): Promise<this> {
        await this.characters
            .find((character) => character.entityId === animation.data.entityId)
            ?.animate(animation, newGame);
        return this;
    }
}

