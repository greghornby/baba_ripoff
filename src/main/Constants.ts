export class Constants {

    static TILE_SIZE = 50;

    static PIXI_DEFAULT_FRAMERATE = 60;
    static FRAMERATE = 60;

    static INACTIVE_TEXT_DARKEN_MULT = 0.6;

    static ANIMATED_SPRITE_TOTAL_FRAMES = 3;
    static DIRECTIONAL_SPRITE_TOTAL_FRAMES = 3;
    static DIRECTION_FRAMES = {
        right: 0,
        down: 1,
        up: 2
    } as const;
}