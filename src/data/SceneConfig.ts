export type SceneConfigType = {
    name: string;
    player_spawn: { x: number; y: number };
    render_config: { tile_size: number; render_type: string };
};

export class SceneConfig {
    private configs: SceneConfigType[] = [];

    loadConfig() {
        this.configs = JSON.parse(`[
            {
                "name": "scene_1",
                "player_spawn": {
                    "x": 0,
                    "y": 0
                },
                "render_config": {
                    "tile_size": 64,
                    "render_type": "ISOMETRIC"
                }
            }
        ]`);
        return this;
    }

    getConfig(name: string): SceneConfigType | undefined {
        return this.configs.find(() => name === name);
    }
}