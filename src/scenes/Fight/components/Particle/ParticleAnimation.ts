export type ParticleAnimationProps = {
    speedY ?: { min :  number, max : number};
    speedX ?: { min :  number, max : number};
    scale ?:  { start :  number, end : number};
    lifespan ?: number;
    frequency ?: number;
    quantity ?: { min :  number, max : number};
}