export const AppEvents = {
    resize: "resize"
};

for (const key in AppEvents) {
    type K = keyof typeof AppEvents;
    AppEvents[key as K] = `App:${AppEvents[key as K]}`;
}