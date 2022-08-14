import { Word } from "../main/Word.js";
import { constructs } from "./constructs.js";
import imagesWall from "./../images/wall.png";

export const words = {

    baba: new Word({image: imagesWall}, "baba", {
        noun: {selector: (construct) => construct === constructs.baba}
    }),

    is: new Word({image: imagesWall}, "is", {
        verb: true
    }),

    you: new Word({image: imagesWall}, "you", {
        tag: true
    }),

    not: new Word({image: imagesWall}, "not", {
        not: true
    })
}