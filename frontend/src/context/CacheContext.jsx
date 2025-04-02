import { createContext, useContext, useState } from "react";

const CacheContext = createContext();
const MAX_CACHE_SIZE = 1000;

export function CacheProvider({ children }) {
    const [cache] = useState(new Map());
    console.log(cache);
    function getCache(id) {
        return cache.get(id) || null;
    }

    function setCache(id, data) {
        
        enforceCacheLimit();
        cache.set(id, data);
    }

    function removeCache(id) {
        cache.delete(id);
    }

    function clearAllCache() {
        cache.clear();
    }

    function enforceCacheLimit() {
        if (cache.size >= MAX_CACHE_SIZE) {
            const firstKey = cache.keys().next().value;
            if (firstKey) {
                cache.delete(firstKey);
            }
        }
    }

    return (
        <CacheContext.Provider value={{ getCache, setCache, removeCache, clearAllCache }}>
            {children}
        </CacheContext.Provider>
    );
}

export function useCache() {
    return useContext(CacheContext);
}
