import useSWR from "swr";
import { useStore } from "../lib/store";
import { useEffect } from "react";

const fetcher = (url: string) => fetch(url, { headers: { "X-Session-Token": "usr_test_123" } }).then(r => r.json());

export function useWeekItems(startDate: Date) {
    const setItems = useStore((state: any) => state.setItems);
    const { data, error, isLoading } = useSWR(`/api/items/week?start=${startDate.toISOString()}&days=60`, fetcher);
    
    useEffect(() => {
        if (data && Array.isArray(data)) {
            setItems(data);
        }
    }, [data, setItems]);
    
    return { items: data, error, isLoading };
}