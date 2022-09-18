export function getContainerToViewScale(
    viewWidth: number,
    viewHeight: number,
    containerWidth: number,
    containerHeight: number
): number {
    const xMult = viewWidth / containerWidth;
    const yMult = viewHeight / containerHeight;
    return containerHeight * xMult > viewHeight ? yMult : xMult;
}