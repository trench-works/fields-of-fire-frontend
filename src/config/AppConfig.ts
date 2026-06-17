import { ConfigLoader } from "../core/config/Config";

export type App = {
    server: {
        url: string;
        port: string;
        protocol: string;
    };
};

export class AppConfigLoader extends ConfigLoader<App> {
    async loadConfig(): Promise<this> {
        const configResponse = await fetch(
            `${window.location.href}config/config.json`,
        );
        this.config = await configResponse.json();
        return this;
    }
}

