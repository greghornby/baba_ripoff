import fs from "fs";
import path from "path";

type Tree<T> = {[key: string]: Tree<T> | T};

function walkDirectory<T>(rootDirectory: string, fileMapper: (file: string, keys: string[]) => [string, T], keys: string[] = []): Tree<T> {
    const obj: Tree<T> = {};

    for (const item of fs.readdirSync(rootDirectory)) {
        if (item.startsWith(".")) {
            continue;
        }
        const fullPath = path.join(rootDirectory, item);
        const stats = fs.statSync(fullPath);
        if (stats.isFile()) {
            const [key, value] = fileMapper(item, keys);
            obj[key] = value;
        } else if (stats.isDirectory()) {
            obj[item] = walkDirectory(fullPath, fileMapper, [...keys, item]);
        }
    }

    return obj;
}

const imports: string[] = [
    `import * as pixijs from "pixi.js";`
];

const imagesTree = walkDirectory(
    path.join(__dirname, "../src/images"),
    (file, keys) => {
        const simpleFileName = file.replace(/\.png$/, "");
        const importName = `${keys.join("_")}_${simpleFileName}`;
        const importStatement = `import ${importName} from "../images/${keys.join("/")}${keys.length > 0 ? "/" : ""}${file}"`;
        imports.push(importStatement);
        return [simpleFileName, `$$makeTextureFromBase64(${importName})$$`];
    }
);

let fileContent = imports.join("\n") + "\n\n";
fileContent += `
const allData: string[] = [];
function makeTextureFromBase64(data: string) {
    const texture = pixijs.Texture.from(data);
    allData.push(data);
    return texture;
}

`;
fileContent += `export const textures = ` + JSON.stringify(imagesTree, null, 4).replace(/\"\$\$/g, "").replace(/\$\$\"/g, "");
fileContent += `
export async function loadTextures() {
    const loader = new pixijs.Loader();
    for (const data of allData) {
        loader.add(data);
    }
    return new Promise(res => {
        loader.load(res);
    });
}
`
fs.writeFileSync(path.join(__dirname, "../src/objects/textures.ts"), fileContent);