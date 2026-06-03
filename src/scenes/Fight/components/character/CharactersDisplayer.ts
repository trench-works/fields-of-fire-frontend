import { FightScene } from "../../fight.scene";
import { Character } from "./Character";
import { ClassStore } from "../../stores/ClassStore";
import { GameStore } from "../../stores/GameStore";
import { FightSceneDisplayer } from "../FightSceneDisplayer";

export class CharactersDisplayer extends FightSceneDisplayer {
    characters: Character[] = [];

    constructor(
        scene: FightScene,
        gameStore: GameStore,
        private readonly classStore: ClassStore,
    ) {
        super(scene, gameStore);
    }

    preRender(): this {
        return this;
    }

    render(): this {
        this.characters = this.gameStore.game.entities.map((entity) =>
            new Character(
                this.scene,
                this.gameStore,
                this.classStore,
                entity.entityId,
            )
                .preRender()
                .render(),
        );
        return this;
    }

    update(): this {
        this.characters.forEach((character) => character.update());
        return this;
    }
}

