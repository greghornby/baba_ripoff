import { Construct } from "../main/Construct.js";
import imagesWall from "./../images/wall.png";

const placeholderImage = imagesWall;

export const constructs = {

    baba: new Construct({
        image: placeholderImage
    }),

    wall: new Construct({
        image: imagesWall
    }),

    leaf: new Construct({
        image: placeholderImage
    }),

}