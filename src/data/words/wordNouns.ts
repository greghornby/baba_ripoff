import { Word } from "../../classes/Word.js";
import { colors } from "../colors.js";
import { textures } from "../textures.js";

const texturePlaceholder = textures.missing;

export default {

    baba: new Word("baba", {
        texture: textures.words.baba_anim,
        color: colors.pink,
        behavior: {
            noun: true
        }
    }),


    wall: new Word("wall", {
        texture: textures.words.wall_anim,
        color: colors.brightBlue,
        behavior: {
            noun: true
        }
    }),

    key: new Word("key", {
        texture: textures.words.key,
        color: colors.gold,
        behavior: {
            noun: true
        }
    }),

    door: new Word("door", {
        texture: textures.words.door,
        color: colors.stop,
        behavior: {
            noun: true
        }
    }),

    rock: new Word("rock", {
        texture: textures.words.rock_anim,
        color: colors.brightBrown,
        behavior: {
            noun: true
        }
    }),

    flag: new Word("flag", {
        texture: textures.words.flag_anim,
        color: colors.gold,
        behavior: {
            noun: true
        }
    }),

    leaf: new Word("leaf", {
        texture: textures.words.leaf,
        color: colors.darkGreen,
        behavior: {
            noun: true
        }
    }),

    skull: new Word("skull", {
        texture: textures.words.skull_anim,
        color: 0xa61b03,
        behavior: {
            noun: true
        }
    }),

    belt: new Word("belt", {
        texture: textures.words.belt,
        color: colors.white,
        behavior: {
            noun: true
        }
    }),

    lava: new Word("lava", {
        texture: textures.words.lava,
        color: colors.lava,
        behavior: {
            noun: true
        }
    }),

    water: new Word("water", {
        texture: textures.words.water_anim,
        color: colors.water,
        behavior: {
            noun: true
        }
    }),
}