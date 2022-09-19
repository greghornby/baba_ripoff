import * as pixi from "pixi.js";
import { LevelPack } from "../../../levels/LevelPack.js";
import { mainPack } from "../../../levels/mainPack.js";
import { destroyOnlyChildren } from "../../../util/pixi/destroyOnlyChildren.js";
import { getContainerCenter } from "../../../util/pixi/getContainerCenter.js";
import { pivotToCenter } from "../../../util/pixi/pivotToCenter.js";
import { LevelController } from "../../LevelController.js";
import { MenuController } from "../MenuController.js";
import { createMenuButton } from "../util/createMenuButton.js";
import { menuColor } from "../util/menuColor.js";

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

export function createLevelSelectScreen(this: MenuController): MenuController["screens"]["levels"] {
    const parent = new pixi.Container();
    const page = new pixi.Container();
    page.y = Y_OFFSETS.ROWS_START;
    parent.addChild(page);

    {
        const backToMainMenu = new pixi.Text("Back to Main Menu", {fill: menuColor.white, fontSize: 40});
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
            previousLevelPacks: [],
            currentPageIndex: 0,
            pages: []
        },
        onGoto: () => {
            const state = this.screens.levels.state;
            state.currentLevelPack = mainPack;
            state.previousLevelPacks.length = 0;
            displayLevelPack.call(this, state.currentLevelPack);
        },
    };
}


function getPagesForPack(this: MenuController, pack: LevelPack): LevelPage[] {
    const ITEMS_PER_PAGE = 9;
    const totalPages = Math.floor(pack.items.length / 9) + 1;

    const pages: LevelPage[] = [];

    pages:
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const itemStartIndex = pageIndex * ITEMS_PER_PAGE;
        const buttons: LevelButton[] = [];
        const isFirst = pageIndex === 0;
        const isLast = pageIndex === (totalPages - 1);
        pages.push({
            index: pageIndex,
            pageNumber: pageIndex+1,
            totalPages: totalPages,
            isFirst: isFirst,
            isLast: isLast,
            buttons: buttons
        });
        if (!isFirst) {
            buttons.push({
                text: "Previous Page",
                row: 3,
                column: 1,
                color: menuColor.fadedPink,
                borderColor: menuColor.pink,
                onClick: () => {
                    const state = this.screens.levels.state;
                    state.currentPageIndex--;
                    displayPage.call(this);
                }
            });
        }
        if (!isLast) {
            buttons.push({
                text: "Next Page",
                row: 3,
                column: 2,
                color: menuColor.fadedPink,
                borderColor: menuColor.pink,
                onClick: () => {
                    const state = this.screens.levels.state;
                    state.currentPageIndex++;
                    displayPage.call(this);
                }
            });
        }
        for (let itemIndex = itemStartIndex; itemIndex < itemStartIndex + ITEMS_PER_PAGE; itemIndex++) {
            const item = pack.items[itemIndex];
            if (!item) {
                break pages;
            }
            const row = Math.floor((itemIndex - itemStartIndex) / 3);
            const column = (itemIndex - itemStartIndex) % 3;
            const text = item instanceof LevelPack ? item.name : item.name;
            const color = item instanceof LevelPack ? menuColor.fadedGold : menuColor.fadedWhite;
            const borderColor = item instanceof LevelPack ? menuColor.gold : menuColor.white;
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
    const state = this.screens.levels.state;
    const pages = getPagesForPack.call(this, pack);
    state.pages = pages;
    state.currentPageIndex = 0;
    displayPage.call(this);

    const cons = this.screens.levels.containers;
    cons.previousPackButton?.destroy();
    cons.previousPackButton = undefined;
    if (state.previousLevelPacks.length) {
        const yOffset = Y_OFFSETS.ROWS_START + 3 * (Y_OFFSETS.BUTTON_HEIGHT + Y_OFFSETS.BUTTON_GAP);
        const xOffset = X_OFFSETS.ROW_MARGIN;
        const previousPackButton = createLevelPageButton(menuColor.fadedGold, menuColor.gold, () => {
            const lastPack = state.previousLevelPacks.pop()!;
            displayLevelPack.call(this, lastPack);
        });
        cons.parent.addChild(previousPackButton);
        cons.previousPackButton = previousPackButton;
        previousPackButton.transform.position.set(xOffset, yOffset);
        addTextToButton(previousPackButton, "Previous Pack");
    }
}


function displayPage(this: MenuController) {
    const state = this.screens.levels.state;
    const page = state.pages[state.currentPageIndex];
    const pageContainer = this.screens.levels.containers.page;
    destroyOnlyChildren(pageContainer);

    for (const button of page.buttons) {
        const buttonContainer = createLevelPageButton(button.color, button.borderColor, button.onClick);
        pageContainer.addChild(buttonContainer);
        let xOffset = X_OFFSETS.ROW_MARGIN + button.column * (X_OFFSETS.BUTTON_WIDTH + X_OFFSETS.BUTTON_GAP);
        let yOffset = button.row * (Y_OFFSETS.BUTTON_HEIGHT + Y_OFFSETS.BUTTON_GAP);
        buttonContainer.transform.position.set(xOffset, yOffset);
        addTextToButton(buttonContainer, button.text);
    }
}


function createLevelPageButton(color: number, borderColor: number, action: () => void): pixi.Container {
    return createMenuButton({
        width: X_OFFSETS.BUTTON_WIDTH,
        height: Y_OFFSETS.BUTTON_HEIGHT,
        fillColor: color,
        borderColor: borderColor,
        action: action,
        borderRadius: 3,
        borderThickness: 4
    });
}

/** Text will be centered by default, use offset to move it relative to the center of the button */
function addTextToButton(button: pixi.Container, text: string, offset?: [x: number | undefined, y: number | undefined]) {
    const textSprite = new pixi.Text(text, {fill: menuColor.white, fontSize: 25, wordWrap: true, wordWrapWidth: X_OFFSETS.BUTTON_WIDTH, align: "center"});
    pivotToCenter(textSprite);
    textSprite.transform.position.set(...getContainerCenter(button));
    button.addChild(textSprite);
}

export type LevelPage = {
    /** starting from 0 */
    index: number;
    /** starting from 1 */
    pageNumber: number;
    totalPages: number;
    isFirst: boolean;
    isLast: boolean;
    buttons: LevelButton[];
}

type LevelButton = {
    text: string;
    column: number;
    row: number;
    color: number;
    borderColor: number;
    onClick: () => void;
}