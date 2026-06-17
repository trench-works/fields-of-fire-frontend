export async function Timeout(time: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, time));
}
