"use client";

import useSWR from "swr";
import { useEffect } from "react";
import { useMyDayStore } from "@/lib/store";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useItems(date?: string) {
    const { setItems } = useMyDayStore();
    const url = date ? `/api/items?date=${date}` : `/api/items/week?start=${new Date().toISOString().split('T')[0]}`;

    const { data, error, isLoading, mutate } = useSWR(url, fetcher);

    useEffect(() => {
        if (data && !Array.isArray(data)) {
            // Handle grouped week data
            const flatItems = Object.values(data).flat() as any[];
            setItems(flatItems);
        } else if (data) {
            setItems(data);
        }
    }, [data, setItems]);

    return {
        items: data,
        isLoading,
        isError: error,
        mutate,
    };
}
