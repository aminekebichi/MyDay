"use client";

import { useState, useEffect } from "react";
import { useStore } from "../../lib/store";
import { LoginForm } from "../../components/auth/LoginForm";
import { SignupForm } from "../../components/auth/SignupForm";
import { Dashboard } from "../../components/home/Dashboard";

export default function Home() {
    const sessionUser = useStore((state) => state.sessionUser);
    const token = useStore((state) => state.token);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");
    const [isMounted, setIsMounted] = useState(false);

    // Ensure we only render content after mounting to avoid hydration mismatch with localStorage
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    if (!sessionUser || !token) {
        return authMode === "login" ? (
            <LoginForm onToggleSignup={() => setAuthMode("signup")} />
        ) : (
            <SignupForm onToggleLogin={() => setAuthMode("login")} />
        );
    }

    return <Dashboard />;
}
