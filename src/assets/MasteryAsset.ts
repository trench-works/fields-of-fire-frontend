import { ImageAssetManager } from "../core/Assets/Asset";

export enum MasteryAssetId {
    UNKNOWN = "unknown",
    //fantassin
    INDOCTRINATION = "indoctrination",
    //fantassin branche 1
    CANNON_FODDER = "cannon_fodder",
    BAYONET_FIXED = "bayonet_fixed",
    INNATE_STRENGTH = "innate_strength",
    TRENCH_BRUTE = "trench_brute",
    STRAIGHT_TOWARD_DEATH = "straight_toward_death",
    ENDURING = "enduring",
    //fantassin branche 2
    WELL_MAINTAINED_GUN = "well_maintained_gun",
    ACCURATE_SHOOTER = "accurate_shooter",
    HEAVY_GUNNER = "heavy_gunner",
    DEADLY_SHOOTER = "deadly_shooter",
    IMPOSSIBLE_SHOT = "impossible_shot",
    HEAVY_FIRE = "heavy_fire",
    REFLEX_SHOT = "reflex_shot",
    //fantassin branche 3
    BULLET_PROOF_VEST  = "bullet_proof_vest",
    BUCKSHOT ="buckshot",
    SAWED_OFF_GUN = "sawed_off_gun",
    GRENADE = "grenade",
    VAPORIZER = "vaporizer",
    DETERRENT = "deterrent",
    FLAME_GRENADE = "flame_grenade",
    REVENGEFULL = "revengefull",
    //medic
    EDUCATED = "educated",
    //medic branche 1
    STRONG_CONSTITUTION = "strong_constitution",
    MEAT_CLEAVER = "meat_cleaver",
    MUSCULAR_INTELLIGENCE = "muscular_intelligence",
    SOILED_CLEAVER = "soiled_cleaver",
    SHARP_CLEAVER = "sharp_cleaver",
    BRUTAL_TREATMENT = "brutal_treatment",
    BLOODTHIRSTY =  "bloodthirsty",
    //medic branche 2
    BETWEEN_BULLET = "between_bullet",
    FIRST_AID = "first_aid",
    RESCUE_SPRINT = "rescue_sprint",
    ACT_FAST = "act_fast",
    EMERGENCY_DEPLOYMENT = "emergency_deployment",
    //medic branche 3
    UPGRADED_KIT = "upgraded_kit",
    DOPING = "doping",
    DRUGS = "drugs",
    PHARMACOLOGIST = "pharmacologist",
    HIPPOCRATE_TREASON = "hippocrate_treason",
    EMERGENCY_DOSE = "emergency_dose",
}

const MasteryAssetEntries = Object.fromEntries(
    Object.values(MasteryAssetId).map((v) => [v, v]),
) as Record<MasteryAssetId, string>;

const MasteryAssetScales = Object.fromEntries(
    Object.values(MasteryAssetId).map((id) => [id, { width: 1, height: 1 }]),
) as Record<MasteryAssetId, { width: number; height: number }>;

class MasteryAssetManager extends ImageAssetManager<MasteryAssetId, string> {
    protected getIds(): MasteryAssetId[] {
        return Object.values(MasteryAssetId);
    }
    protected getAssetFileLink(assetKey: string, asset: string): string {
        return `assets/masteries/${asset}.png`;
    }
    constructor() {
        super("mastery", MasteryAssetEntries, MasteryAssetScales);
    }
}

export const MasteryAsset = new MasteryAssetManager();

export function getMasteryImageKey(masteryId: string): string {
    const id = masteryId.toLowerCase();
    const known = Object.values(MasteryAssetId).includes(id as MasteryAssetId);
    return MasteryAsset.getAssetKey(known ? (id as MasteryAssetId) : MasteryAssetId.UNKNOWN);
}