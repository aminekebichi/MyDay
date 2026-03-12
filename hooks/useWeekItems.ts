import useSWR from "swr";
import { useStore } from "../lib/store";
import { useEffect } from "react";

const fetcher = (url: string) => fetch(url, { headers: { "X-Session-Token": "usr_test_123" } }).then(r => r.json());

export function useWeekItems(startDate: Date) {
    const mergeItems = useStore((state: any) => state.mergeItems);
    const { data, error, isLoading } = useSWR(`/api/items/week?start=${startDate.toISOString()}`, fetcher);
    
    useEffect(() => {
        if (data && Array.isArray(data)) {
            mergeItems(data);
        }
    }, [data, mergeItems]);
    
    return { items: data, error, isLoading };
}