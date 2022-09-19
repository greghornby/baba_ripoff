import { Level } from "../object_classes/Level.js";

export class LevelPack {

    constructor(
        public name: string,
        public items: (
            | Level
            | LevelPack
        )[]
    ) {}
}