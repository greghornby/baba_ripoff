import { debugFlags } from "./debugFlags.js";

export const setDebugFlagsFromQuery = () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    // console.log([...urlSearchParams.entries()]);
    for (const [key, value] of urlSearchParams.entries()) {
        const flagName = key.match(/debug\.(.*)/)?.[1];
        if (!flagName) {
            continue;
        }
        let booleanValue: boolean | undefined = {
            "true": true,
            "false": false,
            "1": true,
            "0": false
        }[value.toLowerCase()];
        console.log(`Set ${flagName} to ${booleanValue}`);
        if (booleanValue !== undefined) {
            (debugFlags as any)[flagName] = booleanValue;
        }
    }
};