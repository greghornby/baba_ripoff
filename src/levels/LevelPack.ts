import { Level } from "../main/Level.js";

export class LevelPack {

    constructor(
        public name: string,
        public items: (
            | Level
            | LevelPack
        )[]
    ) {}
}