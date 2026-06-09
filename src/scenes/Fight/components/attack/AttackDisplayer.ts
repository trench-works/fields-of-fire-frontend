import { ActionAnimationAsset, ActionAssetId } from "../../../../assets";
import { BaseScene, Displayer } from "../../../../core";
import { Game } from "../../../../Model/Game";
import { GameAttackAnimation } from "../../repositories/player.socket";
import { ParticleDisplayer } from "../Particle/ParticleDisplayer";

export class AttackDisplayer extends Displayer {
    protected readonly particleDisplayer: ParticleDisplayer;

    constructor(scene: BaseScene) {
        super(scene);
        this.particleDisplayer = new ParticleDisplayer(scene);
    }

    async animate(
        animation: GameAttackAnimation,
        newGame: Game,
    ): Promise<this> {
        console.log("ATTACK", animation.data);
        switch (animation.data.actionId) {
            case "intimidation":
                this.loadIntimidationAnimation(ActionAnimationAsset.getAssetKey(ActionAssetId.INTIMIDATION),0,5);
                await this.particleDisplayer.animate();
                break;
            
        }
        return this;
    }

    private loadIntimidationAnimation(
        animationName: string,
        startFrame: number,
        endFrame: number,
    ) {
        const frames: Phaser.Types.Animations.AnimationFrame[] = [];

        for (let i = startFrame; i <= endFrame; i++) {
            frames.push({
                key: animationName,
                frame: i,
                duration: i - startFrame < 3 ? 250 : 500, 
            });
        }

        this.scene.anims.create({
            key: animationName,
            frames
        });
    }

    preRender(): this {
        return this;
    }
    render(): this {
        return this;
    }
    update(): this {
        return this;
    }
}

