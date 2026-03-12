import './globals.css';
import { instrumentSerif, geistMono, caveat } from '../lib/fonts';
import { cn } from '../lib/utils';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="en"
            className={cn(instrumentSerif.variable, geistMono.variable, caveat.variable)}
        >
            <body>{children}</body>
        </html>
    );
}
