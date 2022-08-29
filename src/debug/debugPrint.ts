const debugFlags = {
    interactions: false,
    actions: true,
    sentences: true,
};

type debugPrintObject = Record<keyof typeof debugFlags, (...args: any[]) => void>;
export const debugPrint: debugPrintObject = {} as any;
for (const key of Object.keys(debugFlags)) {
    debugPrint[key as keyof debugPrintObject] = (...args: any[]) => debugFlags[key as keyof debugPrintObject] ? console.log(`DEBUG:${key}`, ...args) : undefined;
}