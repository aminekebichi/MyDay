import useSWR from "swr";
import { useStore } from "../lib/store";
import { useEffect } from "react";

export function useWeekItems(startDate: Date) {
    const setItems = useStore((state) => state.setItems);
    const token = useStore((state) => state.token);
    const viewedUserId = useStore((state) => state.viewedUserId);

    const fetcher = (url: string) => fetch(url, { 
        headers: { 
            "X-Session-Token": token || "" 
        } 
    }).then(r => r.json());

    // Build URL with optional userId or global flag
    let url = `/api/items/week?start=${startDate.toISOString()}&days=7`;
    if (viewedUserId === 'all') {
        url += `&global=true`;
    } else if (viewedUserId) {
        url += `&userId=${viewedUserId}`;
    }

    const { data, error, isLoading } = useSWR(token ? url : null, fetcher);
    
    useEffect(() => {
        if (data && Array.isArray(data)) {
            setItems(data);
        }
    }, [data, setItems]);
    
    return { items: data, error, isLoading };
}