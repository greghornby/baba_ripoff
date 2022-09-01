export const queryParams: Record<string, string | undefined> = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop as string) || undefined,
}) as unknown as Record<string, string | undefined>;

(globalThis as any).queryParams = queryParams;