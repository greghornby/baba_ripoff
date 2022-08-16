import { Word } from "../main/Word.js";
import { constructs } from "./constructs.js";
import imagesWall from "./../images/wall.png";

const placeHolderImage = imagesWall;

export const words = {

    baba: new Word({image: placeHolderImage}, "baba", {
        noun: {selector: (construct) => construct === constructs.baba}
    }),

    is: new Word({image: placeHolderImage}, "is", {
        verb: true
    }),

    you: new Word({image: placeHolderImage}, "you", {
        tag: true
    }),

    not: new Word({image: placeHolderImage}, "not", {
        not: true
    }),

    and: new Word({image: placeHolderImage}, "and", {
        and: true
    }),

    lonely: new Word({image: placeHolderImage}, "lonely", {
        prefixCondition: true
    }),

    powered: new Word({image: placeHolderImage}, "powered", {
        prefixCondition: true
    }),

    on: new Word({image: placeHolderImage}, "on", {
        postCondition: {wordTypes: ["noun"]}
    }),

    facing: new Word({image: placeHolderImage}, "facing", {
        postCondition: {wordTypes: ["noun"]}
    }),

    near: new Word({image: placeHolderImage}, "near", {
        postCondition: {wordTypes: ["noun"]}
    }),

    wall: new Word({image: placeHolderImage}, "wall", {
        noun: {selector: (construct) => construct === constructs.wall}
    }),

    leaf: new Word({image: placeHolderImage}, "leaf", {
        noun: {selector: (construct) => construct === constructs.leaf}
    }),
}