export abstract class ConfigLoader<T> {
    protected config!: T;

    abstract loadConfig(): Promise<this>;

    getConfig(): T {
        return this.config;
    }
}

