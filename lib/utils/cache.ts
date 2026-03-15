type CacheData = {
    data: any;
    timestamp: number;
    searchKey?: string;
};

const globalCache: Record<string, CacheData> = {};

export const Gr8Cache = {
    // Save data to cache
    set: (key: string, data: any, searchKey: string = '') => {
        globalCache[key] = {
            data,
            timestamp: Date.now(),
            searchKey
        };
    },

    // Retrieve data
    get: (key: string, searchKey: string = '') => {
        const item = globalCache[key];
        if (!item) return null;

        // If a searchKey is provided (like a search query), 
        // ensure it matches so we don't show old search results.
        if (searchKey !== item.searchKey) return null;

        return item.data;
    },

    // Clear specific cache 
    invalidate: (key: string) => {
        delete globalCache[key];
    },

    // Clear everything 
    clearAll: () => {
        Object.keys(globalCache).forEach(key => delete globalCache[key]);
    }
};