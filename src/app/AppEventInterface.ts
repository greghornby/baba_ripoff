export namespace AppEventInterface {

    export interface Keyboard {
        key: string;
        type: "down" | "up" | "press";
    }

    export interface Swipe {
        direction: "left" | "right" | "up" | "down";
        adjacentDistance: number;
    }

    export interface SingleTap {
        tap: {x: number; y: number};
    }

    export interface DoubleTap {
        taps: [{x: number; y: number}, {x: number; y: number}];
    }
}