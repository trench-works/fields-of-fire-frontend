import { EffectType } from "./Effect";
import { Entity } from "./Entity";

export type Stats = {
    life: number;
    maxLife: number;
    precision: number;
    strength: number;
    armor: number;
    initiative: number;
    dodging: number;
    energy: number;
    mouvement: number;
    totalMouvement: number;
    totalEnergy: number;
};

export class StatsUtils {
    static add(baseStats: Stats, ...stats: Stats[]): Stats {
        const addedStats = { ...baseStats };
        for (const stat of stats) {
            for (const [key, value] of Object.entries(stat)) {
                addedStats[key as keyof Stats] =
                    addedStats[key as keyof Stats] + value;
            }
        }
        return addedStats;
    }

    static fromEntity(entity: Entity): Stats {
        const total = StatsUtils.add(
            entity.stats,
            ...entity.effects
                .filter((effect) => effect.type === EffectType.APPLY)
                .map((effect) => {
                    return effect.modifier;
                }),
        );

        // Caper energy and mouvement à 0
        total.energy = Math.max(total.energy, 0);
        total.mouvement = Math.max(total.mouvement, 0);
        total.totalEnergy = Math.max(total.totalEnergy, 0);
        total.totalMouvement = Math.max(total.totalMouvement, 0);
        total.life = Math.max(total.life, 0);
        return total;
    }
}

