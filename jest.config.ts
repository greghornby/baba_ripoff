export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "jsdom",
    extensionsToTreatAsEsm: [".ts"],
    globals: {
        "ts-jest": {
            tsconfig: "<rootDir>/tests/tsconfig.json",
            useESM: true,
        }
    },
    setupFiles: [
        "./tests/setup/initFiles.ts",
        "jest-canvas-mock",
    ],
    testRegex: "tests/.*\.test\.ts$",
    testPathIgnorePatterns: ['/node_modules/'],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "\\.(png)$": "<rootDir>/tests/fileMapping/image.ts"
    }
}