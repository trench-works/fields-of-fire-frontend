import { RenderResult, SceneRenderConfig } from "./GameScene";
import { Action } from "./Action";
import { Effect } from "./Effect";
import { GameObject, GameObjectProps } from "./GameObject";
import { Position, PositionUtils } from "./Position";
import { Stats } from "./Stats";

export type CharactersProps = GameObjectProps & {
    position: Position;
    sprite: string;
    id: string;
    name: string;
    actionList: Action[];
    baseStats: Stats;
};

export class Character extends GameObject {
  public currentEffect: Effect[] = [];
  public position: Position;
  public sprite: string;
  public id: string;
  public name: string;
  public actionList: Action[];
  public baseStats: Stats;

  constructor(
    
    { position, sprite, id, name, actionList, baseStats, scene }: CharactersProps
  ) {

    super({scene});

    this.position = position;
    this.sprite = sprite;
    this.id = id;
    this.name = name;
    this.actionList = actionList;
    this.baseStats = baseStats;
  }

  get stats() {

    const stats = new Stats( 
      this.baseStats.life,
      this.baseStats.precision, //boost ranged dammage
      this.baseStats.strength, 

      this.baseStats.accuracy, //chance to hit
      this.baseStats.initiative, 
      this.baseStats.energy, 
      this.baseStats.mouvement  
    );

    this.currentEffect.forEach((effect) => {
      stats.addLife(effect.statModification.life)
      stats.addPrecision(effect.statModification.precision)
      stats.addStrengh(effect.statModification.precision)
      stats.addAccuracy(effect.statModification.accuracy)
      stats.addInitiative(effect.statModification.initiative)
      stats.addEnergy(effect.statModification.energy)
      stats.addMouvement(effect.statModification.mouvement)
    })

    return stats;
  }

  render(renderConfig: SceneRenderConfig): RenderResult {
      const renderPosition = PositionUtils.getPixelsFromPosition(
          this.position,
          renderConfig
      );
      return {
          position: renderPosition,
          sprite: this.sprite,
      };
  }

  async recalculate(): Promise<void> {
    return;
  }
}