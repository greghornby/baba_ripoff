import * as pixijs from "pixi.js";
import _missing from "../images/missing.png"
import objects_baba from "../images/objects/baba.png"
import objects_flag from "../images/objects/flag.png"
import objects_rock from "../images/objects/rock.png"
import objects_stone from "../images/objects/stone.png"
import objects_wall from "../images/objects/wall.png"
import objects_wall2 from "../images/objects/wall2.png"
import words_and from "../images/words/and.png"
import words_baba from "../images/words/baba.png"
import words_flag from "../images/words/flag.png"
import words_is from "../images/words/is.png"
import words_not from "../images/words/not.png"
import words_pull from "../images/words/pull.png"
import words_push from "../images/words/push.png"
import words_rock from "../images/words/rock.png"
import words_stop from "../images/words/stop.png"
import words_text from "../images/words/text.png"
import words_wall from "../images/words/wall.png"
import words_win from "../images/words/win.png"
import words_you from "../images/words/you.png"

export const textures = {
    "missing": pixijs.Texture.from(_missing),
    "objects": {
        "baba": pixijs.Texture.from(objects_baba),
        "flag": pixijs.Texture.from(objects_flag),
        "rock": pixijs.Texture.from(objects_rock),
        "stone": pixijs.Texture.from(objects_stone),
        "wall": pixijs.Texture.from(objects_wall),
        "wall2": pixijs.Texture.from(objects_wall2)
    },
    "words": {
        "and": pixijs.Texture.from(words_and),
        "baba": pixijs.Texture.from(words_baba),
        "flag": pixijs.Texture.from(words_flag),
        "is": pixijs.Texture.from(words_is),
        "not": pixijs.Texture.from(words_not),
        "pull": pixijs.Texture.from(words_pull),
        "push": pixijs.Texture.from(words_push),
        "rock": pixijs.Texture.from(words_rock),
        "stop": pixijs.Texture.from(words_stop),
        "text": pixijs.Texture.from(words_text),
        "wall": pixijs.Texture.from(words_wall),
        "win": pixijs.Texture.from(words_win),
        "you": pixijs.Texture.from(words_you)
    }
}