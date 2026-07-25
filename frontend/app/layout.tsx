import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";
import { AuthProvider } from "../lib/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InventoryAI — Demand Forecasting & Inventory Optimization SaaS",
  description: "Enterprise SaaS platform for time-series demand forecasting, multi-objective inventory optimization, and Claude LLM executive reasoning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0A0F1D] text-slate-100 min-h-screen flex antialiased`}>
        <AuthProvider>
          <Navigation />
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
