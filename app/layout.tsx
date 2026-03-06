import type { Metadata } from "next";
// 1. We import Lexend instead of Geist
import { Lexend } from "next/font/google"; 
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  // 2. Updated the title and description for your app
  title: "Gr8Math", 
  description: "Educational Math Application",
};

// 3. We configure the Lexend font here
const lexendFont = Lexend({
  subsets: ["latin"],
  variable: '--font-lexend', // This must match what you put in Tailwind!
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 4. We apply Lexend directly to the body! */}
      <body className={`${lexendFont.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}