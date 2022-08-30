import { Construct } from "../main/Construct.js";
import { Word } from "../main/Word.js";
import { categories } from "./categories.js";
import { textures } from "./textures.js";

const texturePlaceholder = textures.missing;

export const constructs = {

    baba: new Construct({
        texture: textures.objects.baba,
        associatedWord: () => Word.findWordFromText("baba"),
        category: categories.character
    }),

    wall: new Construct({
        texture: textures.objects.wall,
        associatedWord: () => Word.findWordFromText("wall"),
        category: categories.wall
    }),

    rock: new Construct({
        texture: textures.objects.rock,
        associatedWord: () => Word.findWordFromText("rock"),
        category: categories.interactable
    }),

    leaf: new Construct({
        texture: texturePlaceholder,
        associatedWord: () => Word.findWordFromText("leaf"),
        category: categories.interactable
    }),

}