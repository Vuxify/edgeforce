import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EdgeForce - Beat Vegas. Backed by AI.",
  description: "AI-powered sports betting predictions with proven results. Join thousands of winners getting the edge over Vegas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-[#0A0A0F] text-white`}>
        {children}
      </body>
    </html>
  );
}
