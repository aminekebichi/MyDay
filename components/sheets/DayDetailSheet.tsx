"use client";

import { useStore } from "../../lib/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { ItemRow } from "../shared/ItemRow";
import { format, isSameDay } from "date-fns";

export function DayDetailSheet() {
    const selectedDate = useStore((state) => state.selectedDate);
    const setSelectedDate = useStore((state) => state.setSelectedDate);
    const items = useStore((state) => state.items);
    const setEditingItem = useStore((state) => state.setEditingItem);

    if (!selectedDate) return null;

    const dayItems = items.filter((item: any) => 
        isSameDay(new Date(item.date), selectedDate)
    );

    const handleClose = () => {
        setSelectedDate(null);
    };

    return (
        <Sheet open={!!selectedDate} onOpenChange={(open) => !open && handleClose()}>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl bg-elevated border-border">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-xl font-instrument text-primary">
                        {format(selectedDate, "EEEE, MMM d")}
                    </SheetTitle>
                </SheetHeader>
                
                <div className="overflow-y-auto h-full pb-20">
                    {dayItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted">
                            <p className="font-caveat text-xl">No plans for this day yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {dayItems.map((item: any) => (
                                <div key={item.id} onClick={() => {
                                    handleClose();
                                    setEditingItem(item);
                                }} className="cursor-pointer">
                                    <ItemRow item={item} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
