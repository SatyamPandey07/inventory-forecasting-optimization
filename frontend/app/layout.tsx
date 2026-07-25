import './globals.css';
import Navigation from '../components/Navigation';

export const metadata = {
  title: 'InventoryAI — Demand Forecasting & Inventory Optimization SaaS',
  description: 'AI-powered demand forecasting, safety stock optimization, and supply chain simulation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0B0F19] text-slate-100 flex min-h-screen">
        <Navigation />
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
