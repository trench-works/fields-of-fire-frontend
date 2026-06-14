import { FightScene } from "../../fight.scene";
import { Character } from "./Character";
import { GameStore } from "../../stores/GameStore";
import { FightSceneDisplayer } from "../FightSceneDisplayer";
import { GameMoveAnimation } from "../../repositories/player.socket";
import { Game } from "../../../../Model/Game";
import { SoundEffect } from "../../../../core";
import { SoundEffectAsset, SoundEffectAssetId } from "../../../../assets";

export class CharactersDisplayer extends FightSceneDisplayer {
    characters: Character[] = [];

    constructor(scene: FightScene, gameStore: GameStore) {
        super(scene, gameStore);
    }

    preRender(): this {
        return this;
    }

    render(): this {
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
        for (let i = 0; i < this.characters.length; i++) {
            const character = this.characters[i];
            const entity = this.gameStore.getEntity(character.entityId);
            if (entity.dead) {
                this.characters.splice(i, 1);
                new SoundEffect(
                    this.scene,
                    SoundEffectAsset.getAssetKey(SoundEffectAssetId.DEATH),
                ).play();
                character.destroy();
            } else {
                character.update();
            }
        }
        return this;
    }

    async animate(animation: GameMoveAnimation, newGame: Game): Promise<this> {
        return this;
    }
}

