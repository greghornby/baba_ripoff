import * as pixi from "pixi.js";
import { LevelPack } from "../../../levels/LevelPack.js";
import { mainPack } from "../../../levels/mainPack.js";
import { colors } from "../../../objects/colors.js";
import { destroyOnlyChildren } from "../../../util/pixi/destroyOnlyChildren.js";
import { LevelController } from "../../LevelController.js";
import { MenuController } from "../MenuController.js";

export function createLevelSelectScreen(this: MenuController): MenuController["screens"]["levels"] {
    const parent = new pixi.Container();
    const levelButtons = new pixi.Container();
    parent.addChild(levelButtons);
    const backToMainMenu = new pixi.Text("Back to Main Menu", {fill: colors.white, fontSize: 40});
    backToMainMenu.pivot.set(backToMainMenu.width/2, backToMainMenu.height/2);
    backToMainMenu.transform.position.set(this.width/2, 50);
    backToMainMenu.buttonMode = true;
    backToMainMenu.interactive = true;
    backToMainMenu.on("pointertap", () => {
        this.gotoScreen("main");
    });

    parent.addChild(backToMainMenu);

    return {
        name: "levels",
        containers: {parent, levelButtons},
        state: {
            currentLevelPack: mainPack,
            previousLevelPacks: []
        },
        onGoto: () => {
            const state = this.screens.levels.state;
            state.currentLevelPack = mainPack;
            state.previousLevelPacks.length = 0;
            populateLevelsFromPack.call(this, state.currentLevelPack);
        },
    };
}

function populateLevelsFromPack(this: MenuController, pack: LevelPack) {
    const state = this.screens.levels.state;
    const buttons: {text: string; color: number; action: () => void}[] = [];
    if (state.previousLevelPacks.length) {
        buttons.push({text: "< Back", color: colors.pink, action: () => {
            const lastPack = state.previousLevelPacks.pop()!;
            populateLevelsFromPack.call(this, lastPack);
        }});
    }
    for (const item of pack.items) {
        if (item instanceof LevelPack) {
            buttons.push({text: item.name, color: colors.gold, action: () => {
                state.previousLevelPacks.push(pack);
                populateLevelsFromPack.call(this, item);
            }})
        } else {
            buttons.push({
                text: item.name, color: colors.white, action: () => {
                    this.exit();
                    LevelController.load(item);
                }
            });
        }
    }

    const buttonsCont = this.screens.levels.containers.levelButtons;
    destroyOnlyChildren(buttonsCont);
    for (const [index, button] of buttons.entries()) {
        const text = new pixi.Text(button.text, {
            fontSize: 30,
            fill: button.color
        });
        text.buttonMode = true;
        text.interactive = true;
        text.on("pointerdown", button.action);
        text.pivot.set(text.width/2, text.height/2);
        text.transform.position.set(this.width/2, index*35 + 100);
        buttonsCont.addChild(text);
    }
}