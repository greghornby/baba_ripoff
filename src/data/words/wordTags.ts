import { Word } from "../../classes/Word.js";
import { colors } from "../colors.js";
import { textures } from "../textures.js";

const texturePlaceholder = textures.missing;

export default {

    //you related
    you: new Word("you", {
        texture: textures.words.you_anim,
        color: colors.pink,
        behavior: {
            tag: true
        }
    }),

    win: new Word("win", {
        texture: textures.words.win_anim,
        color: 0xe6d705,
        behavior: {
            tag: true
        }
    }),

    defeat: new Word("defeat", {
        texture: textures.words.defeat_anim,
        color: 0x610303,
        behavior: {
            tag: true
        }
    }),

    //movement related
    stop: new Word("stop", {
        texture: textures.words.stop_anim,
        color: colors.stop,
        behavior: {
            tag: true
        }
    }),

    push: new Word("push", {
        texture: textures.words.push_anim,
        color: 0x1850ab,
        behavior: {
            tag: true
        }
    }),

    pull: new Word("pull", {
        texture: textures.words.pull_anim,
        color: 0xa1e600,
        behavior: {
            tag: true
        }
    }),

    move: new Word("move", {
        texture: textures.words.move_anim,
        color: colors.white,
        behavior: {
            tag: true
        }
    }),

    shift: new Word("shift", {
        texture: textures.words.shift,
        color: colors.white,
        behavior: {
            tag: true
        }
    }),

    //destruction related
    open: new Word("open", {
        texture: textures.words.open,
        color: colors.white,
        behavior: {
            tag: true
        }
    }),

    shut: new Word("shut", {
        texture: textures.words.shut,
        color: colors.white,
        behavior: {
            tag: true
        }
    }),

    hot: new Word("hot", {
        texture: textures.words.hot,
        color: colors.lava,
        behavior: {
            tag: true
        }
    }),

    melt: new Word("melt", {
        texture: textures.words.melt,
        color: colors.water,
        behavior: {
            tag: true
        }
    }),

    sink: new Word("sink", {
        texture: textures.words.sink_anim,
        color: colors.water,
        behavior: {
            tag: true
        }
    }),

    float: new Word("float", {
        texture: textures.words.float,
        color: colors.cloud,
        behavior: {
            tag: true
        }
    }),

}