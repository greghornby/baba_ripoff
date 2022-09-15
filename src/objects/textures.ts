import * as pixijs from "pixi.js";
import animations_WinParticle from "../images/animations/WinParticle.png"
import background_wait_hint from "../images/background/wait_hint.png"
import background_wait_hint_mobile from "../images/background/wait_hint_mobile.png"
import _missing from "../images/missing.png"
import objects_baba from "../images/objects/baba.png"
import objects_baba_sprites from "../images/objects/baba_sprites.png"
import objects_belt from "../images/objects/belt.png"
import objects_brick from "../images/objects/brick.png"
import objects_door from "../images/objects/door.png"
import objects_flag from "../images/objects/flag.png"
import objects_key from "../images/objects/key.png"
import objects_lava from "../images/objects/lava.png"
import objects_leaf from "../images/objects/leaf.png"
import objects_rock from "../images/objects/rock.png"
import objects_skull from "../images/objects/skull.png"
import objects_stone from "../images/objects/stone.png"
import objects_wall from "../images/objects/wall.png"
import objects_wall2 from "../images/objects/wall2.png"
import objects_water from "../images/objects/water.png"
import objects_water2 from "../images/objects/water2.png"
import objects_water_animated from "../images/objects/water_animated.png"
import words_all from "../images/words/all.png"
import words_and from "../images/words/and.png"
import words_baba from "../images/words/baba.png"
import words_baba_anim from "../images/words/baba_anim.png"
import words_belt from "../images/words/belt.png"
import words_defeat from "../images/words/defeat.png"
import words_door from "../images/words/door.png"
import words_flag from "../images/words/flag.png"
import words_flag_anim from "../images/words/flag_anim.png"
import words_float from "../images/words/float.png"
import words_hot from "../images/words/hot.png"
import words_is from "../images/words/is.png"
import words_is_anim from "../images/words/is_anim.png"
import words_key from "../images/words/key.png"
import words_lava from "../images/words/lava.png"
import words_leaf from "../images/words/leaf.png"
import words_melt from "../images/words/melt.png"
import words_move from "../images/words/move.png"
import words_not from "../images/words/not.png"
import words_open from "../images/words/open.png"
import words_pull from "../images/words/pull.png"
import words_push from "../images/words/push.png"
import words_rock from "../images/words/rock.png"
import words_rock2 from "../images/words/rock2.png"
import words_rock3 from "../images/words/rock3.png"
import words_rock_anim from "../images/words/rock_anim.png"
import words_shift from "../images/words/shift.png"
import words_shut from "../images/words/shut.png"
import words_sink from "../images/words/sink.png"
import words_skull from "../images/words/skull.png"
import words_stop from "../images/words/stop.png"
import words_stop_anim from "../images/words/stop_anim.png"
import words_text from "../images/words/text.png"
import words_wall from "../images/words/wall.png"
import words_wall_anim from "../images/words/wall_anim.png"
import words_water from "../images/words/water.png"
import words_win from "../images/words/win.png"
import words_win_anim from "../images/words/win_anim.png"
import words_you from "../images/words/you.png"
import words_you_anim from "../images/words/you_anim.png"

export const textures = {
    "animations": {
        "WinParticle": pixijs.Texture.from(animations_WinParticle)
    },
    "background": {
        "wait_hint": pixijs.Texture.from(background_wait_hint),
        "wait_hint_mobile": pixijs.Texture.from(background_wait_hint_mobile)
    },
    "missing": pixijs.Texture.from(_missing),
    "objects": {
        "baba": pixijs.Texture.from(objects_baba),
        "baba_sprites": pixijs.Texture.from(objects_baba_sprites),
        "belt": pixijs.Texture.from(objects_belt),
        "brick": pixijs.Texture.from(objects_brick),
        "door": pixijs.Texture.from(objects_door),
        "flag": pixijs.Texture.from(objects_flag),
        "key": pixijs.Texture.from(objects_key),
        "lava": pixijs.Texture.from(objects_lava),
        "leaf": pixijs.Texture.from(objects_leaf),
        "rock": pixijs.Texture.from(objects_rock),
        "skull": pixijs.Texture.from(objects_skull),
        "stone": pixijs.Texture.from(objects_stone),
        "wall": pixijs.Texture.from(objects_wall),
        "wall2": pixijs.Texture.from(objects_wall2),
        "water": pixijs.Texture.from(objects_water),
        "water2": pixijs.Texture.from(objects_water2),
        "water_animated": pixijs.Texture.from(objects_water_animated)
    },
    "words": {
        "all": pixijs.Texture.from(words_all),
        "and": pixijs.Texture.from(words_and),
        "baba": pixijs.Texture.from(words_baba),
        "baba_anim": pixijs.Texture.from(words_baba_anim),
        "belt": pixijs.Texture.from(words_belt),
        "defeat": pixijs.Texture.from(words_defeat),
        "door": pixijs.Texture.from(words_door),
        "flag": pixijs.Texture.from(words_flag),
        "flag_anim": pixijs.Texture.from(words_flag_anim),
        "float": pixijs.Texture.from(words_float),
        "hot": pixijs.Texture.from(words_hot),
        "is": pixijs.Texture.from(words_is),
        "is_anim": pixijs.Texture.from(words_is_anim),
        "key": pixijs.Texture.from(words_key),
        "lava": pixijs.Texture.from(words_lava),
        "leaf": pixijs.Texture.from(words_leaf),
        "melt": pixijs.Texture.from(words_melt),
        "move": pixijs.Texture.from(words_move),
        "not": pixijs.Texture.from(words_not),
        "open": pixijs.Texture.from(words_open),
        "pull": pixijs.Texture.from(words_pull),
        "push": pixijs.Texture.from(words_push),
        "rock": pixijs.Texture.from(words_rock),
        "rock2": pixijs.Texture.from(words_rock2),
        "rock3": pixijs.Texture.from(words_rock3),
        "rock_anim": pixijs.Texture.from(words_rock_anim),
        "shift": pixijs.Texture.from(words_shift),
        "shut": pixijs.Texture.from(words_shut),
        "sink": pixijs.Texture.from(words_sink),
        "skull": pixijs.Texture.from(words_skull),
        "stop": pixijs.Texture.from(words_stop),
        "stop_anim": pixijs.Texture.from(words_stop_anim),
        "text": pixijs.Texture.from(words_text),
        "wall": pixijs.Texture.from(words_wall),
        "wall_anim": pixijs.Texture.from(words_wall_anim),
        "water": pixijs.Texture.from(words_water),
        "win": pixijs.Texture.from(words_win),
        "win_anim": pixijs.Texture.from(words_win_anim),
        "you": pixijs.Texture.from(words_you),
        "you_anim": pixijs.Texture.from(words_you_anim)
    }
}