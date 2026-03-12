"use client";

import { useState } from "react";
import { useStore } from "../../lib/store";

export function LoginForm({ onToggleSignup }: { onToggleSignup: () => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const login = useStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
            } else {
                login(data.user, data.token);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12" style={{ backgroundColor: "var(--bg-base)" }}>
            <div 
                className="w-full max-w-md p-8 rounded-2xl border shadow-xl" 
                style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
            >
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-instrument mb-2" style={{ color: "var(--text-primary)" }}>MyDay</h1>
                    <p className="font-caveat text-xl" style={{ color: "var(--text-muted)" }}>Sign in to your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest mb-2 font-geist" style={{ color: "var(--text-muted)" }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all font-geist"
                            style={{ 
                                backgroundColor: "var(--bg-elevated)", 
                                color: "var(--text-primary)",
                                borderColor: "var(--border)"
                            }}
                            placeholder="username"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest mb-2 font-geist" style={{ color: "var(--text-muted)" }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all font-geist"
                            style={{ 
                                backgroundColor: "var(--bg-elevated)", 
                                color: "var(--text-primary)",
                                borderColor: "var(--border)"
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-geist text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl font-geist font-bold text-white transition-all transform active:scale-95 disabled:opacity-50"
                        style={{ backgroundColor: "var(--accent)" }}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                    <button 
                        onClick={onToggleSignup}
                        className="text-sm font-geist hover:underline" 
                        style={{ color: "var(--text-muted)" }}
                    >
                        Don't have an account? Sign up
                    </button>
                </div>
            </div>
        </div>
    );
}
