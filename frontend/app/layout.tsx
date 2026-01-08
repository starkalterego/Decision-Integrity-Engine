import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
