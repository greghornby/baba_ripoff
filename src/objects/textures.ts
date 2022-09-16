import * as pixijs from "pixi.js";
import animations_WinParticle from "../images/animations/WinParticle.png";
import background_wait_hint from "../images/background/wait_hint.png";
import background_wait_hint_mobile from "../images/background/wait_hint_mobile.png";
import _missing from "../images/missing.png";
import objects_baba from "../images/objects/baba.png";
import objects_baba_anim from "../images/objects/baba_anim.png";
import objects_baba_sprites from "../images/objects/baba_sprites.png";
import objects_belt from "../images/objects/belt.png";
import objects_brick from "../images/objects/brick.png";
import objects_door from "../images/objects/door.png";
import objects_flag from "../images/objects/flag.png";
import objects_key from "../images/objects/key.png";
import objects_lava from "../images/objects/lava.png";
import objects_leaf from "../images/objects/leaf.png";
import objects_rock from "../images/objects/rock.png";
import objects_skull from "../images/objects/skull.png";
import objects_stone from "../images/objects/stone.png";
import objects_wall from "../images/objects/wall.png";
import objects_wall2 from "../images/objects/wall2.png";
import objects_water from "../images/objects/water.png";
import objects_water2 from "../images/objects/water2.png";
import objects_water_animated from "../images/objects/water_animated.png";
import words_all from "../images/words/all.png";
import words_and from "../images/words/and.png";
import words_baba from "../images/words/baba.png";
import words_baba_anim from "../images/words/baba_anim.png";
import words_belt from "../images/words/belt.png";
import words_defeat from "../images/words/defeat.png";
import words_door from "../images/words/door.png";
import words_flag from "../images/words/flag.png";
import words_flag_anim from "../images/words/flag_anim.png";
import words_float from "../images/words/float.png";
import words_hot from "../images/words/hot.png";
import words_is from "../images/words/is.png";
import words_is_anim from "../images/words/is_anim.png";
import words_key from "../images/words/key.png";
import words_lava from "../images/words/lava.png";
import words_leaf from "../images/words/leaf.png";
import words_melt from "../images/words/melt.png";
import words_move from "../images/words/move.png";
import words_not from "../images/words/not.png";
import words_open from "../images/words/open.png";
import words_pull from "../images/words/pull.png";
import words_push from "../images/words/push.png";
import words_rock from "../images/words/rock.png";
import words_rock2 from "../images/words/rock2.png";
import words_rock3 from "../images/words/rock3.png";
import words_rock_anim from "../images/words/rock_anim.png";
import words_shift from "../images/words/shift.png";
import words_shut from "../images/words/shut.png";
import words_sink from "../images/words/sink.png";
import words_skull from "../images/words/skull.png";
import words_stop from "../images/words/stop.png";
import words_stop_anim from "../images/words/stop_anim.png";
import words_text from "../images/words/text.png";
import words_wall from "../images/words/wall.png";
import words_wall_anim from "../images/words/wall_anim.png";
import words_water from "../images/words/water.png";
import words_win from "../images/words/win.png";
import words_win_anim from "../images/words/win_anim.png";
import words_you from "../images/words/you.png";
import words_you_anim from "../images/words/you_anim.png";


const allData: string[] = [];
function makeTextureFromBase64(data: string) {
    const texture = pixijs.Texture.from(data);
    allData.push(data);
    return texture;
}

export const textures = {
    "animations": {
        "WinParticle": makeTextureFromBase64(animations_WinParticle)
    },
    "background": {
        "wait_hint": makeTextureFromBase64(background_wait_hint),
        "wait_hint_mobile": makeTextureFromBase64(background_wait_hint_mobile)
    },
    "missing": makeTextureFromBase64(_missing),
    "objects": {
        "baba": makeTextureFromBase64(objects_baba),
        "baba_anim": makeTextureFromBase64(objects_baba_anim),
        "baba_sprites": makeTextureFromBase64(objects_baba_sprites),
        "belt": makeTextureFromBase64(objects_belt),
        "brick": makeTextureFromBase64(objects_brick),
        "door": makeTextureFromBase64(objects_door),
        "flag": makeTextureFromBase64(objects_flag),
        "key": makeTextureFromBase64(objects_key),
        "lava": makeTextureFromBase64(objects_lava),
        "leaf": makeTextureFromBase64(objects_leaf),
        "rock": makeTextureFromBase64(objects_rock),
        "skull": makeTextureFromBase64(objects_skull),
        "stone": makeTextureFromBase64(objects_stone),
        "wall": makeTextureFromBase64(objects_wall),
        "wall2": makeTextureFromBase64(objects_wall2),
        "water": makeTextureFromBase64(objects_water),
        "water2": makeTextureFromBase64(objects_water2),
        "water_animated": makeTextureFromBase64(objects_water_animated)
    },
    "words": {
        "all": makeTextureFromBase64(words_all),
        "and": makeTextureFromBase64(words_and),
        "baba": makeTextureFromBase64(words_baba),
        "baba_anim": makeTextureFromBase64(words_baba_anim),
        "belt": makeTextureFromBase64(words_belt),
        "defeat": makeTextureFromBase64(words_defeat),
        "door": makeTextureFromBase64(words_door),
        "flag": makeTextureFromBase64(words_flag),
        "flag_anim": makeTextureFromBase64(words_flag_anim),
        "float": makeTextureFromBase64(words_float),
        "hot": makeTextureFromBase64(words_hot),
        "is": makeTextureFromBase64(words_is),
        "is_anim": makeTextureFromBase64(words_is_anim),
        "key": makeTextureFromBase64(words_key),
        "lava": makeTextureFromBase64(words_lava),
        "leaf": makeTextureFromBase64(words_leaf),
        "melt": makeTextureFromBase64(words_melt),
        "move": makeTextureFromBase64(words_move),
        "not": makeTextureFromBase64(words_not),
        "open": makeTextureFromBase64(words_open),
        "pull": makeTextureFromBase64(words_pull),
        "push": makeTextureFromBase64(words_push),
        "rock": makeTextureFromBase64(words_rock),
        "rock2": makeTextureFromBase64(words_rock2),
        "rock3": makeTextureFromBase64(words_rock3),
        "rock_anim": makeTextureFromBase64(words_rock_anim),
        "shift": makeTextureFromBase64(words_shift),
        "shut": makeTextureFromBase64(words_shut),
        "sink": makeTextureFromBase64(words_sink),
        "skull": makeTextureFromBase64(words_skull),
        "stop": makeTextureFromBase64(words_stop),
        "stop_anim": makeTextureFromBase64(words_stop_anim),
        "text": makeTextureFromBase64(words_text),
        "wall": makeTextureFromBase64(words_wall),
        "wall_anim": makeTextureFromBase64(words_wall_anim),
        "water": makeTextureFromBase64(words_water),
        "win": makeTextureFromBase64(words_win),
        "win_anim": makeTextureFromBase64(words_win_anim),
        "you": makeTextureFromBase64(words_you),
        "you_anim": makeTextureFromBase64(words_you_anim)
    }
}
export async function loadTextures() {
    pixijs.utils.clearTextureCache();
    const loader = new pixijs.Loader();
    for (const data of allData) {
        loader.add(data);
    }
    return new Promise(res => {
        loader.load(res);
    });
}
