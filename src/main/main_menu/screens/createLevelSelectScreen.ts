import * as pixi from "pixi.js";
import { LevelPack } from "../../../levels/LevelPack.js";
import { mainPack } from "../../../levels/mainPack.js";
import { destroyOnlyChildren } from "../../../util/pixi/destroyOnlyChildren.js";
import { LevelController } from "../../LevelController.js";
import { MenuController } from "../MenuController.js";

/**
For the given dimensions
800x600

[H: 25 T: 25]
[H: 40 T: 65] BACK TO MAIN MENU
[H: 35 T: 100]
[H: 100 T: 200] <ROW 1> [Margin 30, Button 170, Gap 15, Button 170, Gap 15, Button 170, Margin 30]
[H: 25 T: 225]
[H: 100 T: 325] <ROW 2>
[H: 25 T: 350]
[H: 100 T: 450] <ROW 3>
[H: 25 T: 475]
[H: 150 T: 575] PREVIOS PACK, PREVIOUS PAGE, NEXT PAGE
*/
const Y_OFFSETS = {
    BACK_TO_MAIN_MENU: 50,
    BUTTON_HEIGHT: 100,
    BUTTON_GAP: 25,
    ROWS_START: 100,
    ROW_HEIGHT: 150,
    PREVIOUSNEXT: 630
};
const X_OFFSETS = {
    ROW_MARGIN: 20,
    BUTTON_GAP: 25,
    BUTTON_WIDTH: 240
};

const colors = {
    white: 0xffffff,
    fadedWhite: 0xbbbbbb,
    gold: 0xffcc00,
    fadedGold: 0xfce483,
    pink: 0xff2299,
    fadedPink: 0xfa8ec8
};

export function createLevelSelectScreen(this: MenuController): MenuController["screens"]["levels"] {
    const parent = new pixi.Container();
    const page = new pixi.Container();
    page.y = Y_OFFSETS.ROWS_START;
    parent.addChild(page);

    {
        const backToMainMenu = new pixi.Text("Back to Main Menu", {fill: colors.white, fontSize: 40});
        backToMainMenu.pivot.set(backToMainMenu.width/2, backToMainMenu.height/2);
        backToMainMenu.transform.position.set(this.width/2, 50);
        backToMainMenu.buttonMode = true;
        backToMainMenu.interactive = true;
        backToMainMenu.on("pointertap", () => {
            this.gotoScreen("main");
        });
        parent.addChild(backToMainMenu);
    }


    return {
        name: "levels",
        containers: {parent, page},
        state: {
            currentLevelPack: mainPack,
            previousLevelPacks: []
        },
        onGoto: () => {
            const state = this.screens.levels.state;
            state.currentLevelPack = mainPack;
            state.previousLevelPacks.length = 0;
            displayLevelPack.call(this, state.currentLevelPack);
        },
    };
}

// function populateLevelsFromPack(this: MenuController, pack: LevelPack) {
//     const state = this.screens.levels.state;
//     const buttons: {text: string; color: number; action: () => void}[] = [];
//     if (state.previousLevelPacks.length) {
//         buttons.push({text: "< Back", color: colors.pink, action: () => {
//             const lastPack = state.previousLevelPacks.pop()!;
//             populateLevelsFromPack.call(this, lastPack);
//         }});
//     }
//     for (const item of pack.items) {
//         if (item instanceof LevelPack) {
//             buttons.push({text: item.name, color: colors.gold, action: () => {
//                 state.previousLevelPacks.push(pack);
//                 populateLevelsFromPack.call(this, item);
//             }})
//         } else {
//             buttons.push({
//                 text: item.name, color: colors.white, action: () => {
//                     this.exit();
//                     LevelController.load(item);
//                 }
//             });
//         }
//     }

//     const buttonsCont = this.screens.levels.containers.levelButtons;
//     destroyOnlyChildren(buttonsCont);
//     for (const [index, button] of buttons.entries()) {
//         const text = new pixi.Text(button.text, {
//             fontSize: 30,
//             fill: button.color
//         });
//         text.buttonMode = true;
//         text.interactive = true;
//         text.on("pointerdown", button.action);
//         text.pivot.set(text.width/2, text.height/2);
//         text.transform.position.set(this.width/2, index*35 + 100);
//         buttonsCont.addChild(text);
//     }
// }





function getPagesForPack(this: MenuController, pack: LevelPack): Page[] {
    const ITEMS_PER_PAGE = 9;
    const totalPages = pack.items.length / 9;

    const pages: Page[] = [];

    pages:
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const itemStartIndex = pageIndex * ITEMS_PER_PAGE;
        const buttons: Button[] = [];
        pages.push({
            index: pageIndex,
            pageNumber: pageIndex+1,
            totalPages: totalPages,
            isFirst: pageIndex === 0,
            isLast: pageIndex === (totalPages - 1),
            buttons: buttons
        });
        for (let itemIndex = itemStartIndex; itemIndex < itemStartIndex + ITEMS_PER_PAGE; itemIndex++) {
            const item = pack.items[itemIndex];
            if (!item) {
                break pages;
            }
            const row = Math.floor((itemIndex - itemStartIndex) / 3);
            const column = (itemIndex - itemStartIndex) % 3;
            const text = item instanceof LevelPack ? item.name : item.name;
            const color = item instanceof LevelPack ? colors.fadedGold : colors.fadedWhite;
            const borderColor = item instanceof LevelPack ? colors.gold : colors.white;
            const onClick = item instanceof LevelPack ?
                () => {
                    const state = this.screens.levels.state;
                    state.previousLevelPacks.push(pack);
                    displayLevelPack.call(this, item);
                } :
                () => {
                    this.exit();
                    LevelController.load(item);
                };
            buttons.push({text, row, column, color, borderColor, onClick});
        }
    }

    return pages;
}


function displayLevelPack(this: MenuController, pack: LevelPack) {
    const pages = getPagesForPack.call(this, pack);
    displayPage.call(this, pages, 0);

    const cons = this.screens.levels.containers;
    const state = this.screens.levels.state;
    cons.previousPackButton?.destroy();
    cons.previousPackButton = undefined;
    if (state.previousLevelPacks.length) {
        const yOffset = Y_OFFSETS.ROWS_START + 3 * (Y_OFFSETS.BUTTON_HEIGHT + Y_OFFSETS.BUTTON_GAP);
        const xOffset = X_OFFSETS.ROW_MARGIN;
        const previousPackButton = createButtonContainer(colors.fadedGold, colors.gold, () => {
            const lastPack = state.previousLevelPacks.pop()!;
            displayLevelPack.call(this, lastPack);
        });
        cons.parent.addChild(previousPackButton);
        cons.previousPackButton = previousPackButton;
        previousPackButton.transform.position.set(xOffset, yOffset);
        addTextToButton(previousPackButton, "Previous Pack");
    }
}


function displayPage(this: MenuController, pages: Page[], pageIndex: number) {
    const page = pages[pageIndex];
    const pageContainer = this.screens.levels.containers.page;
    destroyOnlyChildren(pageContainer);

    for (const button of page.buttons) {
        const buttonContainer = createButtonContainer(button.color, button.borderColor, button.onClick);
        pageContainer.addChild(buttonContainer);
        let xOffset = X_OFFSETS.ROW_MARGIN + button.column * (X_OFFSETS.BUTTON_WIDTH + X_OFFSETS.BUTTON_GAP);
        let yOffset = button.row * (Y_OFFSETS.BUTTON_HEIGHT + Y_OFFSETS.BUTTON_GAP);
        buttonContainer.transform.position.set(xOffset, yOffset);
        addTextToButton(buttonContainer, button.text);
    }
}

function createButtonContainer(color: number, borderColor: number, action: () => void): pixi.Container {
    const container = new pixi.Container();
    container.interactive = true;
    container.buttonMode = true;
    if (action) {
        container.on("pointertap", action);
    }
    const bg = new pixi.Graphics();
    container.addChild(bg);
    bg.beginFill(color);
    bg.drawRect(0, 0, X_OFFSETS.BUTTON_WIDTH, Y_OFFSETS.BUTTON_HEIGHT);
    bg.endFill();
    bg.lineStyle(4, borderColor);
    bg.drawRoundedRect(0, 0, X_OFFSETS.BUTTON_WIDTH, Y_OFFSETS.BUTTON_HEIGHT, 3);
    return container;
}

/** Text will be centered by default, use offset to move it relative to the center of the button */
function addTextToButton(button: pixi.Container, text: string, offset?: [x: number | undefined, y: number | undefined]) {
    const textSprite = new pixi.Text(text, {fill: colors.white, fontSize: 25, wordWrap: true, wordWrapWidth: X_OFFSETS.BUTTON_WIDTH, align: "center"});
    pivotToCenter(textSprite);
    textSprite.transform.position.set(...containerCenter(button));
    button.addChild(textSprite);
}

function containerCenter(container: pixi.Container): [x: number, y: number] {
    return [container.width/2, container.height/2];
}

function pivotToCenter(container: pixi.Container) {
    container.pivot.set(...containerCenter(container));
}

type Page = {
    /** starting from 0 */
    index: number;
    /** starting from 1 */
    pageNumber: number;
    totalPages: number;
    isFirst: boolean;
    isLast: boolean;
    buttons: Button[];
}

type Button = {
    text: string;
    column: number;
    row: number;
    color: number;
    borderColor: number;
    onClick: () => void;
}