import * as pixi from "pixi.js";
import { AppEventSystem } from "./AppEventSystem.js";

export class App {

    private static _singleton: App;
    static get(): App {
        return App._singleton;
    }

    public pixiApp: pixi.Application;
    public events: AppEventSystem;

    constructor(public containerElement: HTMLElement) {
        App._singleton = this;

        this.pixiApp = new pixi.Application({
            resizeTo: containerElement,
            backgroundColor: 0x012101,
        });

        // this.pixiApp.renderer.plugins.interaction.moveWhenInside = true;


        this.events = new AppEventSystem();

        this.pixiApp.view.classList.add("game");
        this.pixiApp.view.tabIndex = 1;
        const styleElement = document.createElement("style");
        styleElement.innerHTML = `.game:focus {outline: none;}`;
        document.head.appendChild(styleElement);
    }
}