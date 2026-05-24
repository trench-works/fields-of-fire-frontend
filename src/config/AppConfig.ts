import { ConfigLoader } from "../core/config/Config";

export type App = {
    user?: {
        id: string;
    };
    server: {
        url: string;
        port: string;
        protocol: string;
    };
};

export class AppConfigLoader extends ConfigLoader<App> {
    async loadConfig(): Promise<this> {
        const configResponse = await fetch(
            "http://localhost:5173/config/config.json",
        );
        this.config = await configResponse.json();
        return this;
    }
}

