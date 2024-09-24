import { Inria_Sans, Caveat } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './src/styles/globals.css';
import { Metadata } from 'next';

const inriaSans = Inria_Sans({ subsets: ['latin'], variable: '--font-inria-sans', weight: ['300', '400', '700'] });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'ReadMe ReadYou',
  description: 'An AI-powered tool to help you read and understand documents',
  // Add more metadata fields as needed
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inriaSans.variable} ${caveat.variable}`}>
        <ThemeProvider attribute="class">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
