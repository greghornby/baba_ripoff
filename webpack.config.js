import path from "path";
import ResolveTypeScriptPlugin from "resolve-typescript-plugin";
import * as fs from "fs";

export default {
    entry: {
        index: "./src/index.ts",
        textures: "./src/objects/textures.ts"
    },
    devtool: "eval-cheap-source-map",
    experiments: {
        topLevelAwait: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.png$/,
                use: 'url-loader'
            }
        ],
    },
    resolve: {
        plugins: [
            new ResolveTypeScriptPlugin(),
        ]
    },
    optimization: {
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                default: false,
                vendors: false,

                vendor: {
                    name: "vendor",
                    // sync + async chunks
                    chunks: "all",
                    // import file path containing node_modules
                    test: /node_modules/
                },
            }
        }
    },
    output: {
        filename: "[name].js",
        path: fromRoot("build"),
    },
}

function fromRoot(filepath) {
    return path.join(path.dirname(new URL(import.meta.url).pathname), filepath);
}