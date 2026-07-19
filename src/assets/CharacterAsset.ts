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
    "IDLE-DR": [0, 1],
    "IDLE-DL": [2, 3],
    "IDLE-UL": [4, 5],
    "IDLE-UR": [6, 7],
};

const defaultAnimations = {
    ...defaultIdleAnimations,
    "SCOPE-DR": [8],
    "SCOPE-DL": [9],
    "SCOPE-UL": [10],
    "SCOPE-UR": [11],
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
                    "SCOPE-DR": [8, 9],
                    "SCOPE-DL": [10, 11],
                    "SCOPE-UL": [12, 13],
                    "SCOPE-UR": [14, 15],
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

