export class AnimationUtils {
    static getFullAnimationTime(frameTime: number[]): number {
        return frameTime.reduce((a, b) => a + b, 0);
    }
}

