import { Level } from "../classes/Level.js";

export class LevelPack {

    constructor(
        public name: string,
        public items: (
            | Level
            | LevelPack
        )[]
    ) {}
}