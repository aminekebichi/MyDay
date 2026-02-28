import type { Metadata } from "next";
import { geistMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
    title: "MyDay",
    description: "A unified daily planning dashboard",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistMono.variable} font-mono antialiased`}>
                {children}
            </body>
        </html>
    );
}
