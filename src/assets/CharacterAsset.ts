import {
    ImageAssetManager,
    SpriteSheetAssetManager,
} from "../core/Assets/Asset";

export enum CharacterAssetId {
    ENTENTE_FANTASSIN = "entente_fantassin",
    ENTENTE_MEDIC = "entente_medic",
    ENTENTE_CAPORAL = "entente_caporal",
    ALLIANCE_FANTASSIN = "alliance_fantassin",
    ALLIANCE_MEDIC = "alliance_medic",
    ALLIANCE_CAPORAL = "alliance_caporal",
    ENTENTE_BRISE_BARRICADE = "entente_brise_barricade",
    BARRICADE = "barricade",
}

const CharacterAssetEntries = Object.fromEntries(
    Object.values(CharacterAssetId).map((value) => [value, value]),
) as Record<CharacterAssetId, string>;

class CharacterIconAssetManager extends ImageAssetManager<
    CharacterAssetId,
    string
> {
    protected getIds(): CharacterAssetId[] {
        return Object.values(CharacterAssetId);
    }

    protected getAssetFileLink(_: string, asset: string): string {
        return `assets/characters/icons/${asset}.png`;
    }

    constructor() {
        super("characters_icons", CharacterAssetEntries, {
            [CharacterAssetId.ENTENTE_FANTASSIN]: { width: 1, height: 1 },
            [CharacterAssetId.ENTENTE_MEDIC]: { width: 1, height: 1 },
            [CharacterAssetId.ENTENTE_CAPORAL]: { width: 1, height: 1 },
            [CharacterAssetId.ALLIANCE_FANTASSIN]: { width: 1, height: 1 },
            [CharacterAssetId.ALLIANCE_MEDIC]: { width: 1, height: 1 },
            [CharacterAssetId.ALLIANCE_CAPORAL]: { width: 1, height: 1 },
            [CharacterAssetId.ENTENTE_BRISE_BARRICADE]: { width: 1, height: 1 },
            [CharacterAssetId.BARRICADE]: { width: 1, height: 1 },
        });
    }
}

export const CharacterIconAsset = new CharacterIconAssetManager();

class CharacterCloseupAssetManager extends ImageAssetManager<
    CharacterAssetId,
    string
> {
    protected getIds(): CharacterAssetId[] {
        return Object.values(CharacterAssetId);
    }

    protected getAssetFileLink(_: string, asset: string): string {
        return `assets/characters/icons/${asset}_closeup.png`;
    }

    constructor() {
        super("characters_closeup", CharacterAssetEntries, {
            [CharacterAssetId.ENTENTE_FANTASSIN]: { width: 1, height: 1 },
            [CharacterAssetId.ENTENTE_MEDIC]: { width: 1, height: 1 },
            [CharacterAssetId.ENTENTE_CAPORAL]: { width: 1, height: 1 },
            [CharacterAssetId.ALLIANCE_FANTASSIN]: { width: 1, height: 1 },
            [CharacterAssetId.ALLIANCE_MEDIC]: { width: 1, height: 1 },
            [CharacterAssetId.ALLIANCE_CAPORAL]: { width: 1, height: 1 },
            [CharacterAssetId.ENTENTE_BRISE_BARRICADE]: { width: 1, height: 1 },
            [CharacterAssetId.BARRICADE]: { width: 1, height: 1 },
        });
    }
}

export const CharacterCloseupAsset = new CharacterCloseupAssetManager();

export enum CharacterAnimation {
    IDLE = "IDLE",
    SCOPE = "SCOPE",
}

const defaultIdleAnimations = {
    "IDLE-DR": { frames: [0, 1], duration: [500, 500] },
    "IDLE-DL": { frames: [2, 3], duration: [500, 500] },
    "IDLE-UL": { frames: [4, 5], duration: [500, 500] },
    "IDLE-UR": { frames: [6, 7], duration: [500, 500] },
};

const defaultAnimations = {
    ...defaultIdleAnimations,
    "SCOPE-DR": { frames: [8], duration: [1000] },
    "SCOPE-DL": { frames: [9], duration: [1000] },
    "SCOPE-UL": { frames: [10], duration: [1000] },
    "SCOPE-UR": { frames: [11], duration: [1000] },
};

class CharacterSpriteAssetManager extends SpriteSheetAssetManager<
    CharacterAssetId,
    string
> {
    protected getIds(): CharacterAssetId[] {
        return Object.values(CharacterAssetId);
    }

    protected getAssetFileLink(_: string, asset: string): string {
        return `assets/characters/sprites/${asset}_spritesheet.png`;
    }

    constructor() {
        super(
            "characters_sprite",
            CharacterAssetEntries,
            {
                [CharacterAssetId.ENTENTE_FANTASSIN]: {
                    frameWidth: 96,
                    frameHeight: 128,
                    frameTime: [],
                },
                [CharacterAssetId.ENTENTE_MEDIC]: {
                    frameWidth: 96,
                    frameHeight: 128,
                    frameTime: [],
                },
                [CharacterAssetId.ENTENTE_CAPORAL]: {
                    frameWidth: 96,
                    frameHeight: 128,
                    frameTime: [],
                },
                [CharacterAssetId.ENTENTE_BRISE_BARRICADE]: {
                    frameWidth: 96,
                    frameHeight: 140,
                    frameTime: [],
                },
                [CharacterAssetId.ALLIANCE_FANTASSIN]: {
                    frameWidth: 96,
                    frameHeight: 128,
                    frameTime: [],
                },
                [CharacterAssetId.ALLIANCE_MEDIC]: {
                    frameWidth: 96,
                    frameHeight: 128,
                    frameTime: [],
                },
                [CharacterAssetId.ALLIANCE_CAPORAL]: {
                    frameWidth: 96,
                    frameHeight: 128,
                    frameTime: [],
                },
                [CharacterAssetId.BARRICADE]: {
                    frameWidth: 64,
                    frameHeight: 64,
                    frameTime: [],
                },
            },
            {
                [CharacterAssetId.ENTENTE_FANTASSIN]: defaultAnimations,
                [CharacterAssetId.ENTENTE_MEDIC]: defaultAnimations,
                [CharacterAssetId.ENTENTE_CAPORAL]: defaultAnimations,
                [CharacterAssetId.ENTENTE_BRISE_BARRICADE]: {
                    ...defaultIdleAnimations,
                    "SCOPE-DR": { frames: [8, 9], duration: [500, 500] },
                    "SCOPE-DL": { frames: [10, 11], duration: [500, 500] },
                    "SCOPE-UL": { frames: [12, 13], duration: [500, 500] },
                    "SCOPE-UR": { frames: [14, 15], duration: [500, 500] },
                },
                [CharacterAssetId.ALLIANCE_FANTASSIN]: defaultAnimations,
                [CharacterAssetId.ALLIANCE_MEDIC]: defaultAnimations,
                [CharacterAssetId.ALLIANCE_CAPORAL]: defaultAnimations,
                [CharacterAssetId.BARRICADE]: defaultAnimations,
            },
        );
    }
}

export const CharacterSpriteAsset = new CharacterSpriteAssetManager();

