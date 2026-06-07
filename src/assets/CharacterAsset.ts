import { ImageAssetManager, SpriteAssetManager } from "../core/Assets/Asset";

export enum CharacterAssetId {
    ENTENTE_FANTASSIN = "entente_fantassin",
    ENTENTE_MEDIC = "entente_medic",
    ENTENTE_CAPORAL = "entente_caporal",
    ALLIANCE_FANTASSIN = "alliance_fantassin",
    ALLIANCE_MEDIC = "alliance_medic",
    ALLIANCE_CAPORAL = "alliance_caporal",
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
        super("characters_icons", CharacterAssetEntries);
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
        super("characters_closeup", CharacterAssetEntries);
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
            frameWidth: 96,
            frameHeight: 128,
        });
    }
}

export const CharacterSpriteAsset = new CharacterSpriteAssetManager();

