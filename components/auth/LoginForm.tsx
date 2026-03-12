"use client";

import { useState } from "react";
import { useStore } from "../../lib/store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const login = useStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            login(data.user, data.token);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-sm p-8 rounded-xl border bg-surface" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-serif text-primary" style={{ borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem' }}>Welcome Back</h1>
                <p className="text-sm font-geist text-muted">Enter your credentials to access your dashboard.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="username" style={{ color: 'var(--text-primary)' }}>Username</Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="admin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="bg-base border-border"
                        style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="password" style={{ color: 'var(--text-primary)' }}>Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-base border-border"
                        style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
                    />
                </div>

                {error && (
                    <div className="p-3 text-xs rounded bg-red-500/10 border border-red-500/20 text-red-400 font-geist">
                        {error}
                    </div>
                )}

                <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full mt-2"
                    style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                >
                    {isLoading ? "Signing in..." : "Sign In"}
                </Button>
            </form>
        </div>
    );
}
