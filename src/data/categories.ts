import { Category } from "../classes/Category.js";

export const categories = {

    other: new Category({
        name: "other",
        priority: 0
    }),

    decoration: new Category({
        name: "decoration",
        priority: -1
    }),

    floor: new Category({
        name: "floor",
        priority: 1e1
    }),

    wall: new Category({
        name: "wall",
        priority: 1e2
    }),

    interactable: new Category({
        name: "interactable",
        priority: 1e3
    }),

    character: new Category({
        name: "character",
        priority: 1e6
    }),

    text: new Category({
        name: "text",
        priority: 1e6 - 1
    })
}