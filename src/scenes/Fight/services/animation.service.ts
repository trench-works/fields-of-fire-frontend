import {
    ActionAssetId,
    SoundEffectAsset,
    SoundEffectAssetId,
} from "../../../assets";
import { ParticleAssetId } from "../../../assets/ParticleAsset";
import {
    BaseScene,
    Depth,
    GRID_LEVELS_OFFSET,
    SoundEffect,
    Timeout,
} from "../../../core";
import { AttackDisplayer } from "../display/attack.displayer";
import { CharactersDisplayer } from "../display/characters.displayer";
import { ParticleDisplayer } from "../display/particles.displayer";
import { ToastDisplayer } from "../display/toast.displayer";
import { GameAttackAnimation } from "../repositories/game.repository";
import { GameStore } from "../stores/game.store";
import { GridStore } from "../stores/grid.store";

export class AnimationService {
    constructor(
        private readonly scene: BaseScene,
        // Stores
        private readonly gridStore: GridStore,
        private readonly gameStore: GameStore,
        // Displayers
        private readonly attackDisplayer: AttackDisplayer,
        private readonly character: CharactersDisplayer,
        private readonly toaster: ToastDisplayer,
        private readonly particleDisplayer: ParticleDisplayer,
    ) {}

    async animateAttack(animation: GameAttackAnimation): Promise<this> {
        const {
            data: { entityId, actionId, target, origin, hits, path },
        } = animation;
        const cell = this.gridStore.get(target);
        if (!cell) {
            return this;
        }
        switch (actionId) {
            case ActionAssetId.SHOOT:
                {
                    this.character.changeDirection(target, entityId);
                    this.character.scope(entityId, 700);
                    await Timeout(200);
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.SHOT),
                    ).play();
                    this.attackDisplayer.playDamages(
                        this.gameStore.game,
                        hits,
                        origin,
                        target,
                    );
                    this.scene.cameras.main.shake(200, 0.001);
                    this.toaster.attackToast(animation);
                    await this.toaster.attackToast(animation);
                    await Timeout(200);
                }
                break;
            case ActionAssetId.BAYONET:
                {
                    this.character.changeDirection(target, entityId);
                    this.character.scope(entityId, 700);
                    await Timeout(200);
                    this.attackDisplayer.playDamages(
                        this.gameStore.game,
                        hits,
                        origin,
                        target,
                    );
                    this.scene.cameras.main.shake(200, 0.001);
                    this.toaster.attackToast(animation);
                    await this.toaster.attackToast(animation);
                    await Timeout(200);
                }
                break;
            case ActionAssetId.AMPUTATE:
                {
                    this.character.changeDirection(target, entityId);
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(
                            SoundEffectAssetId.AMPUTATE,
                        ),
                    ).play();
                    this.toaster.attackToast(animation);
                    await this.attackDisplayer.playDamages(
                        this.gameStore.game,
                        hits,
                        origin,
                        target,
                    );
                    await this.toaster.attackToast(animation);
                }
                break;
            case ActionAssetId.INTIMIDATION:
                {
                    this.character.changeDirection(target, entityId);
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(
                            SoundEffectAssetId.INTIMIDATION,
                        ),
                    ).play();
                    await this.attackDisplayer.playActionAnimation(
                        ActionAssetId.INTIMIDATION,
                        target,
                    );
                    await this.particleDisplayer.animate(
                        ParticleAssetId.DEBUFF,
                        cell.position.x,
                        cell.position.y,
                        Depth.getFromGridPosition(
                            cell.index,
                            GRID_LEVELS_OFFSET.ANIMATION_4,
                        ),
                    );
                }
                break;
            case ActionAssetId.HEAL:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.DOPAGE),
                    ).play();
                    this.character.changeDirection(target, entityId);
                    await this.particleDisplayer.animate(
                        ParticleAssetId.HEAL,
                        cell.position.x,
                        cell.position.y,
                        Depth.getFromGridPosition(
                            cell.index,
                            GRID_LEVELS_OFFSET.ANIMATION_4,
                        ),
                    );
                    await Timeout(500);
                }
                break;
            case ActionAssetId.ARTILLERY_SUPPORT:
                {
                    this.character.changeDirection(target, entityId);
                    await this.attackDisplayer.playActionAnimation(
                        ActionAssetId.ARTILLERY_SUPPORT,
                        target,
                        {
                            x: 0.5,
                            y: 0.7,
                        },
                        -1,
                    );

                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.CANNON),
                    ).play();
                    this.scene.cameras.main.shake(200, 0.005);
                    await this.toaster.attackToast(animation);
                    this.attackDisplayer.playDamages(
                        this.gameStore.game,
                        hits,
                        origin,
                        target,
                    ); //TODO mage particle blood splatter
                    await this.particleDisplayer.animate(
                        ParticleAssetId.SMOKE,
                        cell.position.x,
                        cell.position.y,
                        Depth.getFromGridPosition(
                            cell.index,
                            GRID_LEVELS_OFFSET.ANIMATION_4,
                        ),
                    );
                    this.toaster.attackToast(animation);
                }
                break;
            case ActionAssetId.DOPAGE:
                {
                    this.character.changeDirection(target, entityId);
                    await this.particleDisplayer.animate(
                        ParticleAssetId.BOOST,
                        cell.position.x,
                        cell.position.y,
                        Depth.getFromGridPosition(
                            cell.index,
                            GRID_LEVELS_OFFSET.ANIMATION_4,
                        ),
                    );
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.DOPAGE),
                    ).play();
                    await Timeout(1000);
                }
                break;
            case ActionAssetId.FIGHTING_DRUG:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.DOPAGE),
                    ).play();
                    this.character.changeDirection(target, entityId);
                    await this.particleDisplayer.animate(
                        ParticleAssetId.BOOST,
                        cell.position.x,
                        cell.position.y,
                        Depth.getFromGridPosition(
                            cell.index,
                            GRID_LEVELS_OFFSET.ANIMATION_4,
                        ),
                    );
                    await Timeout(1000);
                }
                break;
            case ActionAssetId.CHARGE:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.CHARGE),
                    ).play();
                    await this.particleDisplayer.animate(
                        ParticleAssetId.BOOST,
                        cell.position.x,
                        cell.position.y,
                        Depth.getFromGridPosition(
                            cell.index,
                            GRID_LEVELS_OFFSET.ANIMATION_4,
                        ),
                    );
                    await Timeout(1000);
                }
                break;
            case ActionAssetId.SABER:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.SABER),
                    ).play();
                    this.attackDisplayer.playDamages(
                        this.gameStore.game,
                        hits,
                        origin,
                        target,
                    );
                    await this.toaster.attackToast(animation);
                }
                break;
            case ActionAssetId.SHIELD_RUSH:
                {
                    if (path) {
                        await this.character.animate({
                            key: "move",
                            data: { entityId, path },
                        });
                    }
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(
                            SoundEffectAssetId.SHIELD_IMPACT,
                        ),
                    ).play();
                    this.attackDisplayer.playDamages(
                        this.gameStore.game,
                        hits,
                        origin,
                        target,
                    );
                    await this.toaster.attackToast(animation);
                }
                break;
            case ActionAssetId.BARRICADE:
                {
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(SoundEffectAssetId.HAMMER),
                    ).play();
                    await Timeout(1000);
                }
                break;
            case ActionAssetId.BREAK:
                {
                    //this.scene.character.changeDirection(target, entityId);
                    this.character.scope(entityId, 700);
                    await Timeout(350);
                    new SoundEffect(
                        this.scene,
                        SoundEffectAsset.getAssetKey(
                            SoundEffectAssetId.BATTLE_AXE,
                        ),
                    ).play();
                    this.attackDisplayer.playDamages(
                        this.gameStore.game,
                        hits,
                        origin,
                        target,
                    );
                    await this.toaster.attackToast(animation);
                }
                break;
        }
        return this;
    }
}

