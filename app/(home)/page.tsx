"use client";

import { useStore } from "../../lib/store";
import { Dashboard } from "../../components/home/Dashboard";
import { LoginForm } from "../../components/auth/LoginForm";
import { SignupForm } from "../../components/auth/SignupForm";
import { useState } from "react";

export default function Home() {
    const sessionUser = useStore((state) => state.sessionUser);
    const token = useStore((state) => state.token);
    const [isLogin, setIsLogin] = useState(true);

    if (sessionUser && token) {
        return <Dashboard />;
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-base" style={{ backgroundColor: 'var(--bg-base)' }}>
            <div className="w-full max-w-sm flex flex-col gap-4">
                {isLogin ? <LoginForm /> : <SignupForm />}
                
                <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm font-geist text-muted hover:text-primary transition-colors text-center"
                    style={{ color: 'var(--text-muted)' }}
                >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
            </div>
        </main>
    );
}
