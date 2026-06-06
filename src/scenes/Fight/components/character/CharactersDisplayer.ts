import { FightScene } from "../../fight.scene";
import { Character } from "./Character";
import { GameStore } from "../../stores/GameStore";
import { FightSceneDisplayer } from "../FightSceneDisplayer";
import { GameMoveAnimation } from "../../repositories/player.socket";
import { Game } from "../../../../Model/Game";

export class CharactersDisplayer extends FightSceneDisplayer {
    characters: Character[] = [];

    constructor(scene: FightScene, gameStore: GameStore) {
        super(scene, gameStore);
    }

    preRender(): this {
        return this;
    }

    render(): this {
        this.characters = this.gameStore.game.entities.map((entity) =>
            new Character(this.scene, this.gameStore, entity.entityId)
                .preRender()
                .render(),
        );
        return this;
    }

    update(): this {
        for (const character of this.characters) {
            const entity = this.gameStore.getEntity(character.entityId);
            if (entity.dead) {
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

