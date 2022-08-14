export default {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    extensionsToTreatAsEsm: [".ts"],
    globals: {
        "ts-jest": {
            tsconfig: "<rootDir>/tsconfig.json",
            useESM: true,
        }
    },
    setupFiles: [
        "jest-canvas-mock"
    ],
    testRegex: "tests/.*\.test\.ts$",
    testPathIgnorePatterns: ['/node_modules/'],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "\\.(png)$": "<rootDir>/tests/fileMapping/image.ts"
    }
}