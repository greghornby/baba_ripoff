const debugPrintEnabledFlags = {
    interactions: false,
    actions: true,
    sentences: true,
};

type debugPrintObject = Record<keyof typeof debugPrintEnabledFlags, (...args: any[]) => void>;
export const debugPrint: debugPrintObject = {} as any;
for (const key of Object.keys(debugPrintEnabledFlags)) {
    debugPrint[key as keyof debugPrintObject] = (...args: any[]) => debugPrintEnabledFlags[key as keyof debugPrintObject] ? console.log(`DEBUG:${key}`, ...args) : undefined;
}