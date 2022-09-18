import * as pixi from "pixi.js";
import { MenuController } from "../MenuController.js";

export function createMainScreen(this: MenuController): MenuController["screens"]["main"] {
    const parent = new pixi.Container();

    const levelsText = new pixi.Text("LEVELS", new pixi.TextStyle({
        fontSize: 30,
        fill: 0xffffff
    }));
    parent.addChild(levelsText);
    levelsText.pivot.set(levelsText.width / 2, 0);
    levelsText.transform.position.set(this.width / 2, 100);
    levelsText.buttonMode = true;
    levelsText.interactive = true;
    levelsText.on("pointertap", () => this.gotoScreen("levels"));
    return {
        name: "main",
        containers: {parent}
    };
}