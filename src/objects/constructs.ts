import { Construct } from "../main/Construct.js";
import { Word } from "../main/Word.js";
import { categories } from "./categories.js";
import { colors } from "./colors.js";
import { textures } from "./textures.js";

const texturePlaceholder = textures.missing;

export const constructs = {

    baba: new Construct({
        texture: textures.objects.baba,
        associatedWord: () => Word.findWordFromText("baba"),
        category: categories.character,
        color: colors.white
    }),

    wall: new Construct({
        texture: textures.objects.wall2,
        associatedWord: () => Word.findWordFromText("wall"),
        category: categories.wall,
        color: colors.darkBlue
    }),

    rock: new Construct({
        texture: textures.objects.rock,
        associatedWord: () => Word.findWordFromText("rock"),
        category: categories.interactable,
        color: colors.lightBrown
    }),

    leaf: new Construct({
        texture: texturePlaceholder,
        associatedWord: () => Word.findWordFromText("leaf"),
        category: categories.interactable,
        color: colors.darkGreen
    }),

}