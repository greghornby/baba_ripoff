import { Construct } from "../classes/Construct.js";
import { categories } from "./categories.js";
import { colors } from "./colors.js";
import { textures } from "./textures.js";

const texturePlaceholder = textures.missing;

export const constructs = {

    baba: new Construct("baba", {
        texture: textures.objects.baba_anim,
        category: categories.character,
        color: colors.white
    }),

    wall: new Construct("wall", {
        texture: textures.objects.wall_anim,
        category: categories.wall,
        color: 0x1c3773
    }),

    door: new Construct("door", {
        texture: textures.objects.door,
        category: categories.wall,
        color: colors.stop
    }),

    key: new Construct("key", {
        texture: textures.objects.key_anim,
        category: categories.interactable,
        color: colors.gold
    }),

    rock: new Construct("rock", {
        texture: textures.objects.rock_anim,
        category: categories.interactable,
        color: colors.lightBrown
    }),

    flag: new Construct("flag", {
        texture: textures.objects.flag_anim,
        category: categories.interactable,
        color: colors.gold
    }),

    leaf: new Construct("leaf", {
        texture: textures.objects.leaf,
        category: categories.interactable,
        color: colors.darkGreen
    }),

    skull: new Construct("skull", {
        texture: textures.objects.skull_anim,
        category: categories.character, //@todo create danger category
        color: 0xa61b03
    }),

    belt: new Construct("belt", {
        texture: textures.objects.belt,
        category: categories.floor,
        color: 0x999999
    }),

    lava: new Construct("lava", {
        texture: textures.objects.lava,
        category: categories.floor,
        color: colors.lava
    }),

    water: new Construct("water", {
        texture: textures.objects.water_animated,
        category: categories.floor,
        color: colors.water
    }),

}