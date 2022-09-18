import { App } from "../../app/App.js";

export function getViewCenter(): [x: number, y: number] {
    const {pixiApp: {view}} = App.get();
    return [view.width/2, view.height/2];
}