import * as pixijs from "pixi.js";
import animations_WinParticle from "../images/animations/WinParticle.png";
import background_move_hint_desktop from "../images/background/move_hint_desktop.png";
import background_move_hint_mobile from "../images/background/move_hint_mobile.png";
import background_pause_hint_desktop from "../images/background/pause_hint_desktop.png";
import background_pause_hint_mobile from "../images/background/pause_hint_mobile.png";
import background_wait_hint_desktop from "../images/background/wait_hint_desktop.png";
import background_wait_hint_mobile from "../images/background/wait_hint_mobile.png";
import menus_pause_menu from "../images/menus/pause_menu.png";
import _missing from "../images/missing.png";
import objects_baba from "../images/objects/baba.png";
import objects_baba_anim from "../images/objects/baba_anim.png";
import objects_belt from "../images/objects/belt.png";
import objects_brick from "../images/objects/brick.png";
import objects_door from "../images/objects/door.png";
import objects_flag from "../images/objects/flag.png";
import objects_flag_anim from "../images/objects/flag_anim.png";
import objects_key from "../images/objects/key.png";
import objects_key_anim from "../images/objects/key_anim.png";
import objects_lava from "../images/objects/lava.png";
import objects_leaf from "../images/objects/leaf.png";
import objects_rock from "../images/objects/rock.png";
import objects_rock_anim from "../images/objects/rock_anim.png";
import objects_skull from "../images/objects/skull.png";
import objects_skull_anim from "../images/objects/skull_anim.png";
import objects_wall_anim from "../images/objects/wall_anim.png";
import objects_water_animated from "../images/objects/water_animated.png";
import words_all from "../images/words/all.png";
import words_and from "../images/words/and.png";
import words_and_anim from "../images/words/and_anim.png";
import words_baba from "../images/words/baba.png";
import words_baba_anim from "../images/words/baba_anim.png";
import words_belt from "../images/words/belt.png";
import words_defeat from "../images/words/defeat.png";
import words_defeat_anim from "../images/words/defeat_anim.png";
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
import words_move_anim from "../images/words/move_anim.png";
import words_not from "../images/words/not.png";
import words_not_anim from "../images/words/not_anim.png";
import words_open from "../images/words/open.png";
import words_pull from "../images/words/pull.png";
import words_pull_anim from "../images/words/pull_anim.png";
import words_push from "../images/words/push.png";
import words_push_anim from "../images/words/push_anim.png";
import words_rock from "../images/words/rock.png";
import words_rock2 from "../images/words/rock2.png";
import words_rock3 from "../images/words/rock3.png";
import words_rock_anim from "../images/words/rock_anim.png";
import words_shift from "../images/words/shift.png";
import words_shut from "../images/words/shut.png";
import words_sink from "../images/words/sink.png";
import words_sink_anim from "../images/words/sink_anim.png";
import words_skull from "../images/words/skull.png";
import words_skull_anim from "../images/words/skull_anim.png";
import words_stop from "../images/words/stop.png";
import words_stop_anim from "../images/words/stop_anim.png";
import words_text from "../images/words/text.png";
import words_text_anim from "../images/words/text_anim.png";
import words_wall from "../images/words/wall.png";
import words_wall_anim from "../images/words/wall_anim.png";
import words_water from "../images/words/water.png";
import words_water_anim from "../images/words/water_anim.png";
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
        "move_hint_desktop": makeTextureFromBase64(background_move_hint_desktop),
        "move_hint_mobile": makeTextureFromBase64(background_move_hint_mobile),
        "pause_hint_desktop": makeTextureFromBase64(background_pause_hint_desktop),
        "pause_hint_mobile": makeTextureFromBase64(background_pause_hint_mobile),
        "wait_hint_desktop": makeTextureFromBase64(background_wait_hint_desktop),
        "wait_hint_mobile": makeTextureFromBase64(background_wait_hint_mobile)
    },
    "menus": {
        "pause_menu": makeTextureFromBase64(menus_pause_menu)
    },
    "missing": makeTextureFromBase64(_missing),
    "objects": {
        "baba": makeTextureFromBase64(objects_baba),
        "baba_anim": makeTextureFromBase64(objects_baba_anim),
        "belt": makeTextureFromBase64(objects_belt),
        "brick": makeTextureFromBase64(objects_brick),
        "door": makeTextureFromBase64(objects_door),
        "flag": makeTextureFromBase64(objects_flag),
        "flag_anim": makeTextureFromBase64(objects_flag_anim),
        "key": makeTextureFromBase64(objects_key),
        "key_anim": makeTextureFromBase64(objects_key_anim),
        "lava": makeTextureFromBase64(objects_lava),
        "leaf": makeTextureFromBase64(objects_leaf),
        "rock": makeTextureFromBase64(objects_rock),
        "rock_anim": makeTextureFromBase64(objects_rock_anim),
        "skull": makeTextureFromBase64(objects_skull),
        "skull_anim": makeTextureFromBase64(objects_skull_anim),
        "wall_anim": makeTextureFromBase64(objects_wall_anim),
        "water_animated": makeTextureFromBase64(objects_water_animated)
    },
    "words": {
        "all": makeTextureFromBase64(words_all),
        "and": makeTextureFromBase64(words_and),
        "and_anim": makeTextureFromBase64(words_and_anim),
        "baba": makeTextureFromBase64(words_baba),
        "baba_anim": makeTextureFromBase64(words_baba_anim),
        "belt": makeTextureFromBase64(words_belt),
        "defeat": makeTextureFromBase64(words_defeat),
        "defeat_anim": makeTextureFromBase64(words_defeat_anim),
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
        "move_anim": makeTextureFromBase64(words_move_anim),
        "not": makeTextureFromBase64(words_not),
        "not_anim": makeTextureFromBase64(words_not_anim),
        "open": makeTextureFromBase64(words_open),
        "pull": makeTextureFromBase64(words_pull),
        "pull_anim": makeTextureFromBase64(words_pull_anim),
        "push": makeTextureFromBase64(words_push),
        "push_anim": makeTextureFromBase64(words_push_anim),
        "rock": makeTextureFromBase64(words_rock),
        "rock2": makeTextureFromBase64(words_rock2),
        "rock3": makeTextureFromBase64(words_rock3),
        "rock_anim": makeTextureFromBase64(words_rock_anim),
        "shift": makeTextureFromBase64(words_shift),
        "shut": makeTextureFromBase64(words_shut),
        "sink": makeTextureFromBase64(words_sink),
        "sink_anim": makeTextureFromBase64(words_sink_anim),
        "skull": makeTextureFromBase64(words_skull),
        "skull_anim": makeTextureFromBase64(words_skull_anim),
        "stop": makeTextureFromBase64(words_stop),
        "stop_anim": makeTextureFromBase64(words_stop_anim),
        "text": makeTextureFromBase64(words_text),
        "text_anim": makeTextureFromBase64(words_text_anim),
        "wall": makeTextureFromBase64(words_wall),
        "wall_anim": makeTextureFromBase64(words_wall_anim),
        "water": makeTextureFromBase64(words_water),
        "water_anim": makeTextureFromBase64(words_water_anim),
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
