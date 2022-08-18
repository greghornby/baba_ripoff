import path from "path";
import ResolveTypeScriptPlugin from "resolve-typescript-plugin";

export default {
    entry: './src/index.ts',
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
        plugins: [new ResolveTypeScriptPlugin()]
    },
    output: {
        filename: 'index.js',
        path: fromRoot("build"),
    },
}

function fromRoot(filepath) {
    return path.join(path.dirname(new URL(import.meta.url).pathname), filepath);
}