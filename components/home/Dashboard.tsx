"use client";

import { CalendarStrip } from './CalendarStrip';
import { TodoToday } from './TodoToday';
import { OverviewSection } from './OverviewSection';
import { Clock } from './Clock';
import { AddItemSheet } from '../sheets/AddItemSheet';
import { AddButton } from './AddButton';
import { useStore } from '../../lib/store';
import { useState, useEffect } from 'react';

export function Dashboard() {
    const sessionUser = useStore((state) => state.sessionUser);
    const logout = useStore((state) => state.logout);
    const viewedUserId = useStore((state) => state.viewedUserId);
    const setViewedUserId = useStore((state) => state.setViewedUserId);
    
    const [users, setUsers] = useState<any[]>([]);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        if (sessionUser?.role === 'ADMIN') {
            fetch('/api/users', {
                headers: { 'X-Session-Token': useStore.getState().token || '' }
            })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setUsers(data);
            });
        }
    }, [sessionUser]);

    const viewedUser = viewedUserId === 'all' 
        ? { displayName: 'All Users', id: 'all' } 
        : (users.find(u => u.id === viewedUserId) || sessionUser);

    return (
        <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
            <div className="w-full min-h-screen flex flex-col relative">
                <header
                    className="px-4 py-3 border-b flex-none flex items-center justify-between"
                    style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <h1
                            className="text-xl font-instrument"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            MyDay
                        </h1>
                        {sessionUser?.role === 'ADMIN' && (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="p-1.5 rounded-lg border transition-all"
                                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
                                    title="Switch User View"
                                >
                                    <span className="text-xs font-geist px-1" style={{ color: 'var(--text-muted)' }}>
                                        Viewing: {viewedUser?.displayName || '...'}
                                    </span>
                                </button>
                                {showUserMenu && (
                                    <div 
                                        className="absolute top-full left-0 mt-2 w-48 rounded-xl border shadow-2xl z-50 overflow-hidden"
                                        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
                                    >
                                        <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
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
                                                    className="w-full text-left px-4 py-3 text-sm font-geist hover:bg-opacity-10"
                                                    style={{ 
                                                        color: viewedUserId === u.id ? 'var(--accent)' : 'var(--text-primary)',
                                                        backgroundColor: viewedUserId === u.id ? 'var(--bg-surface)' : 'transparent'
                                                    }}
                                                >
                                                    {u.displayName} {u.id === sessionUser.id && '(Me)'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Clock />
                        <button 
                            onClick={logout}
                            className="p-2 rounded-full hover:bg-opacity-10 transition-all"
                            style={{ color: 'var(--text-muted)' }}
                            title="Sign Out"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                            </svg>
                        </button>
                    </div>
                </header>

                <section
                    className="flex-none border-b"
                    style={{ borderColor: 'var(--border)' }}
                    aria-label="Weekly calendar"
                >
                    <CalendarStrip />
                </section>

                <section
                    className="flex-none border-b"
                    style={{ borderColor: 'var(--border)' }}
                    aria-label="Weekly overview"
                >
                    <OverviewSection />
                </section>

                <section className="flex-1 pb-32">
                    <TodoToday />
                </section>
            </div>

            <AddButton />
            <AddItemSheet />
        </main>
    );
}
