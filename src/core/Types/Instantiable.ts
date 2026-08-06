// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Instantiable<T = any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): T;
}

