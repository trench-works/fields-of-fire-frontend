import { EffectType } from "./Effect";
import { Entity } from "./Entity";

export type Stats = {
    life: number;
    precision: number;
    strength: number;
    armor: number;
    initiative: number;
    dodging: number;
    energy: number;
    mouvement: number;
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
        return StatsUtils.add(
            entity.stats,
            ...entity.effects
                .filter((effect) => effect.type === EffectType.APPLY)
                .map((effect) => effect.modifier),
        );
    }
}

