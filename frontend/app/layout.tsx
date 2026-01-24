import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from '@/lib/toast';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: "Decision Integrity Engine",
  description: "Portfolio decision platform with governance-first design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
