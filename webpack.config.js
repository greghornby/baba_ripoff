import path from "path";
import ResolveTypeScriptPlugin from "resolve-typescript-plugin";
// import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

export default {
    entry: {
        index: "./src/index.ts"
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
    plugins: [
        // new BundleAnalyzerPlugin(),
    ],
    optimization: {
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                default: false,
                vendors: false,

                minSize: false,

                vendor: {
                    name: "vendor",
                    // sync + async chunks
                    chunks: "all",
                    // import file path containing node_modules
                    test: /node_modules/
                },

                textures: {
                    name: "images",
                    chunks: "all",
                    test: /src\/images\/.*/
                }
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