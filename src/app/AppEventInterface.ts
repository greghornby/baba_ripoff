export namespace AppEventInterface {

    export interface Keyboard {
        key: string;
        type: "down" | "up" | "press";
    }

    export interface Swipe {
        direction: "left" | "right" | "up" | "down";
        adjacentDistance: number;
    }

    export interface DoubleTap {
        x: number;
        y: number;
    }
}