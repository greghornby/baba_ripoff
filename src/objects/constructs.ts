import { Construct } from "../main/Construct.js";
import { Word } from "../main/Word.js";
import { categories } from "./categories.js";
import { colors } from "./colors.js";
import { textures } from "./textures.js";

const texturePlaceholder = textures.missing;

export const constructs = {

    baba: new Construct({
        texture: textures.objects.baba_sprites,
        textureHasDirections: true,
        associatedWord: () => Word.findWordFromText("baba"),
        category: categories.character,
        color: colors.white
    }),

    wall: new Construct({
        texture: textures.objects.brick,
        associatedWord: () => Word.findWordFromText("wall"),
        category: categories.wall,
        color: 0x1c3773
    }),

    door: new Construct({
        texture: textures.objects.door,
        associatedWord: () => Word.findWordFromText("door"),
        category: categories.wall,
        color: colors.stop
    }),

    key: new Construct({
        texture: textures.objects.key,
        textureHasDirections: true,
        associatedWord: () => Word.findWordFromText("key"),
        category: categories.interactable,
        color: colors.gold
    }),

    rock: new Construct({
        texture: textures.objects.rock,
        associatedWord: () => Word.findWordFromText("rock"),
        category: categories.interactable,
        color: colors.lightBrown
    }),

    flag: new Construct({
        texture: textures.objects.flag,
        associatedWord: () => Word.findWordFromText("flag"),
        category: categories.interactable,
        color: colors.gold
    }),

    leaf: new Construct({
        texture: textures.objects.leaf,
        associatedWord: () => Word.findWordFromText("leaf"),
        category: categories.interactable,
        color: colors.darkGreen
    }),

    skull: new Construct({
        texture: textures.objects.skull,
        textureHasDirections: true,
        associatedWord: () => Word.findWordFromText("skull"),
        category: categories.character, //@todo create danger category
        color: 0xa61b03
    }),

    belt: new Construct({
        texture: textures.objects.belt,
        textureHasDirections: true,
        associatedWord: () => Word.findWordFromText("belt"),
        category: categories.floor,
        color: 0x999999
    }),

    lava: new Construct({
        texture: textures.objects.lava,
        associatedWord: () => Word.findWordFromText("lava"),
        category: categories.floor,
        color: colors.lava
    }),

    water: new Construct({
        texture: textures.objects.water_animated,
        animatedTexture: true,
        associatedWord: () => Word.findWordFromText("water"),
        category: categories.floor,
        color: colors.water
    }),

}