import * as pixi from "pixi.js";
import { AppEventEnum } from "./AppEventEnum.js";
import { AppEventSystem } from "./AppEventSystem.js";

export class App {

    private static _singleton: App;
    static get(): App {
        return App._singleton;
    }

    public pixiApp: pixi.Application;
    public resizeObserver: ResizeObserver;
    public events: AppEventSystem;

    constructor(containerElement: HTMLElement) {
        App._singleton = this;

        this.pixiApp = new pixi.Application({
            resizeTo: containerElement,
        });

        this.events = new AppEventSystem();

        this.pixiApp.view.classList.add("game");
        this.pixiApp.view.tabIndex = 1;
        const styleElement = document.createElement("style");
        styleElement.innerHTML = `.game:focus {outline: none;}`;
        document.head.appendChild(styleElement);

        this.resizeObserver = new ResizeObserver(
            () => globalThis.dispatchEvent(new Event(AppEventEnum.resize))
        );
        this.resizeObserver.observe(containerElement);
    }
}