import localFont from 'next/font/local';
import { Instrument_Serif, Caveat } from 'next/font/google';

export const instrumentSerif = Instrument_Serif({ 
  subsets: ['latin'], 
  weight: '400' 
});

export const caveat = Caveat({ 
  subsets: ['latin'] 
});

export const geistMono = localFont({
  src: '../node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.woff2',
  variable: '--font-geist-mono',
});