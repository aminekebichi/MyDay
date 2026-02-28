import { Instrument_Serif, Geist_Mono, Caveat } from 'next/font/google';

export const instrumentSerif = Instrument_Serif({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-instrument',
});

export const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
});

export const caveat = Caveat({
    subsets: ['latin'],
    variable: '--font-caveat',
});
