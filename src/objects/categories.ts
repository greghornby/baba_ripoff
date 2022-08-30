import { Category } from "../main/Category.js";

export const categories = {

    other: new Category({
        name: "other",
        zIndex: 0
    }),

    decoration: new Category({
        name: "decoration",
        zIndex: -1
    }),

    floor: new Category({
        name: "floor",
        zIndex: 1e1
    }),

    wall: new Category({
        name: "wall",
        zIndex: 1e2
    }),

    interactable: new Category({
        name: "interactable",
        zIndex: 1e3
    }),

    character: new Category({
        name: "character",
        zIndex: 1e6
    }),

    text: new Category({
        name: "text",
        zIndex: 1e6 - 1
    })
}