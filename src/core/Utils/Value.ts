export function isDefined<T>(val: T | undefined): val is T {
    return Boolean(val);
}
