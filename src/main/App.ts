import * as pixi from "pixi.js";
import { AppEvents } from "./AppEvent.js";

export class App {

    private static _singleton: App;
    static get(): App {
        return App._singleton;
    }

    public pixiApp: pixi.Application;
    public resizeObserver: ResizeObserver;

    constructor(containerElement: HTMLElement) {
        App._singleton = this;

        this.pixiApp = new pixi.Application({
            resizeTo: containerElement,
        });

        this.resizeObserver = new ResizeObserver(
            () => globalThis.dispatchEvent(new Event(AppEvents.resize))
        );
        this.resizeObserver.observe(containerElement);
    }
}