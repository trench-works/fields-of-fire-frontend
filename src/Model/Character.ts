import { Action } from "./Action";
import { Effect } from "./Effect";
import { Stats } from "./Stats";

// interface ICharacter {
//   id : string;
//   name : string;
// }

export class Character {
  public currentEffect: Effect[] = [];

  constructor(
    public id: string,
    public name: string,
    public sprite: string,
    public actionList: Action[],
    public baseStats: Stats,
    public x: number,
    public y: number,
  ) {}

  get stats() {
    // return Object.fromEntries(
    // (Object.keys(this.baseStats) as (keyof Stats)[]).map((key : keyof Stats) : [string, number] => [key, (this.baseStats[key] || 0) + (statsModif[key] || 0)])
    // );

    const stats = new Stats( 
      this.baseStats.life,
      this.baseStats.precision, //boost ranged dammage
      this.baseStats.strengh, 
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

  
}

//   constructor(
//   ) {}
//   withId(id : number) : this & Pick<ICharacter, 'id'>{
//     return Object.assign(this, {id});
//   }
//   build(this: ICharacter) {
//     return new Character(this);
//   }
// }
// export class Character implements ICharacter{
//   public id : string;
//   constructor(character: ICharacter) {
//     Object.assign(this, character);
//   }
// }