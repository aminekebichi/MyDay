"use client";

import { useEffect, useState } from "react";
import { useStore } from "../../lib/store";
import { CalendarStrip } from "./CalendarStrip";
import { TodoToday } from "./TodoToday";
import { DayDetailSheet } from "../sheets/DayDetailSheet";
import { AddItemSheet } from "../sheets/AddItemSheet";
import { useWeekItems } from "../../hooks/useWeekItems";
import { LogOut, Users, ChevronDown } from "lucide-react";

export function Dashboard() {
    const sessionUser = useStore((state) => state.sessionUser);
    const token = useStore((state) => state.token);
    const logout = useStore((state) => state.logout);
    const viewedUserId = useStore((state) => state.viewedUserId);
    const setViewedUserId = useStore((state) => state.setViewedUserId);
    
    const [users, setUsers] = useState<any[]>([]);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Fetch weekly items to populate the store
    useWeekItems(new Date());

    useEffect(() => {
        if (sessionUser?.role === 'ADMIN' && token) {
            fetch("/api/users", {
                headers: { 'X-Session-Token': token }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setUsers(data);
                })
                .catch(err => console.error("Failed to fetch users:", err));
        }
    }, [sessionUser, token]);

    const viewedUser = viewedUserId === 'all' 
        ? { displayName: 'All Users', id: 'all' } 
        : (users.find(u => u.id === viewedUserId) || sessionUser);

    return (
        <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
            <header className="sticky top-0 z-10 w-full border-b bg-surface px-4 py-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mx-auto max-w-lg">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-serif text-primary" style={{ color: 'var(--text-primary)' }}>MyDay</h1>
                        <p className="text-[10px] font-caveat text-muted" style={{ color: 'var(--text-muted)' }}>your day, unified.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {sessionUser?.role === 'ADMIN' && (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-base text-xs font-geist"
                                    style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                >
                                    <Users size={14} className="text-accent" style={{ color: 'var(--accent)' }} />
                                    <span>{viewedUser?.displayName || 'Loading...'}</span>
                                    <ChevronDown size={12} className="opacity-50" />
                                </button>

                                {showUserMenu && (
                                    <div 
                                        className="absolute right-0 mt-2 w-56 rounded-lg border shadow-xl z-50 overflow-hidden bg-surface"
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                                    >
                                        <div className="px-4 py-2 border-b bg-base bg-opacity-50" style={{ borderColor: 'var(--border)' }}>
                                            <p className="text-[10px] uppercase tracking-tighter font-geist" style={{ color: 'var(--text-muted)' }}>Select Calendar</p>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            <button
                                                onClick={() => {
                                                    setViewedUserId('all');
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm font-geist hover:bg-opacity-10"
                                                style={{ 
                                                    color: viewedUserId === 'all' ? 'var(--accent)' : 'var(--text-primary)',
                                                    backgroundColor: viewedUserId === 'all' ? 'var(--bg-surface)' : 'transparent',
                                                    borderBottom: '1px solid var(--border)'
                                                }}
                                            >
                                                🌍 All Users (Master View)
                                            </button>
                                            {users.map(u => (
                                                <button
                                                    key={u.id}
                                                    onClick={() => {
                                                        setViewedUserId(u.id);
                                                        setShowUserMenu(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-sm font-geist hover:bg-opacity-10 transition-colors"
                                                    style={{ 
                                                        color: viewedUserId === u.id ? 'var(--accent)' : 'var(--text-primary)',
                                                        backgroundColor: viewedUserId === u.id ? 'var(--bg-surface)' : 'transparent',
                                                        borderBottom: '1px solid var(--border)'
                                                    }}
                                                >
                                                    {u.displayName} {u.id === sessionUser.id && "(You)"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <button 
                            onClick={logout}
                            className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            title="Log Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-lg pb-24">
                <CalendarStrip />
                <TodoToday />
            </div>

            <AddItemSheet />
            <DayDetailSheet />
        </main>
    );
}
