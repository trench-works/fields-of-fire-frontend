import { FightScene } from "../../fight.scene";
import { GameStore } from "../../stores/GameStore";
import { FightSceneDisplayer } from "../FightSceneDisplayer";
import { GameMoveAnimation } from "../../repositories/player.socket";
import { Game } from "../../../../Model/Game";
import { ParticleAssetId } from "../../../../assets/ParticleAsset";

export class ParticleDisplayer extends FightSceneDisplayer {

    protected buffEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: FightScene, gameStore: GameStore) {
        super(scene, gameStore);
    }

    preRender(): this {
        return this;
    }

    render(): this {
        this.buffEmitter = this.scene.add.particles(0, 0, ParticleAssetId.BOOST, {
            speedY: { min: -200, max: -350 },
            speedX: { min: -30, max: 30 },

            scale: { start: 0.6, end: 0.1 },
            alpha: { start: 1, end: 0 },

            lifespan: 800,           
            frequency: 40,           
            quantity: { min: 2, max: 4 }, 

            angle: { min: -100, max: -80 },

            emitting: false
        });

        return this;
    }

    update(): this {
        return this;
    }

    async animate(animation: GameMoveAnimation, newGame: Game): Promise<this> {
        await new Promise((resolve,reject)=> {

            this.buffEmitter.addEmitZone(
                new Phaser.GameObjects.Particles.Zones.RandomZone({
                    getRandomPoint: (point: any) => {
                        point.x = Phaser.Math.Between(-30, 30);
                        point.y = Phaser.Math.Between(0, 20);
                        return point;
                    }
                })
            );
            
            this.buffEmitter.start();

            // this.scene.time.delayedCall(1000, () => {
            //     this.buffEmitter.stop();
            //     resolve(this);
            // });
        });
        return this;
    }
}

