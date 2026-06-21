import { ImageAssetManager, SpriteAssetManager } from "../core/Assets/Asset";

export enum CharacterAssetId {
    ENTENTE_FANTASSIN = "entente_fantassin",
    ENTENTE_MEDIC = "entente_medic",
    ENTENTE_CAPORAL = "entente_caporal",
    ALLIANCE_FANTASSIN = "alliance_fantassin",
    ALLIANCE_MEDIC = "alliance_medic",
    ALLIANCE_CAPORAL = "alliance_caporal",
    ENTENTE_BRISE_BARRICADE = "entente_brise_barricade",
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
            [CharacterAssetId.ENTENTE_BRISE_BARRICADE]:{ width: 1, height: 1 },
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
        });
    }
}

export const CharacterCloseupAsset = new CharacterCloseupAssetManager();

class CharacterSpriteAssetManager extends SpriteAssetManager<
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
        super("characters_sprite", CharacterAssetEntries, {
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
                frameHeight: 128,
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
        });
    }
}

export const CharacterSpriteAsset = new CharacterSpriteAssetManager();

