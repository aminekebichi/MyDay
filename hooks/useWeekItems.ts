import useSWR from "swr";
import { useStore } from "../lib/store";
import { useEffect } from "react";

const fetcher = ([url, token]: [string, string | null]) => {
    if (!token) return null;
    return fetch(url, { headers: { "X-Session-Token": token } }).then(r => r.json());
};

export function useWeekItems(startDate: Date) {
    const setItems = useStore((state) => state.setItems);
    const token = useStore((state) => state.token);
    const viewedUserId = useStore((state) => state.viewedUserId);
    
    // If viewedUserId is 'all', use the global flag. Otherwise use userId if set.
    const isGlobal = viewedUserId === 'all';
    const userIdParam = !isGlobal && viewedUserId ? `&userId=${viewedUserId}` : "";
    const globalParam = isGlobal ? "&global=true" : "";
    const url = `/api/items/week?start=${startDate.toISOString()}&days=60${userIdParam}${globalParam}`;
    
    const { data, error, isLoading } = useSWR(token ? [url, token] : null, fetcher);
    
    useEffect(() => {
        if (data && Array.isArray(data)) {
            setItems(data);
        }
    }, [data, setItems]);
    
    return { items: data, error, isLoading };
}