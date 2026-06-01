import { FightSceneDisplayer } from "./FightSceneDisplayer";

export class CharactersDisplayer extends FightSceneDisplayer {
    preRender(): this {
        return this;
    }
    render(): this {
        this.scene.characters.forEach((entity) => {
            entity.spawn(
                this.scene,
                this.scene.scaleFactor,
                this.scene.gridPositions,
            );
        });
        return this;
    }
    update(): this {
        return this;
    }
}

