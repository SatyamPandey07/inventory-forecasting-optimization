'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

const PUBLIC_ROUTES = ['/login', '/signup'];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
    if (!user && !isPublic) {
      router.replace('/login');
    }
  }, [user, loading, pathname, router]);

  // While loading session from storage, show nothing to avoid flash
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1D]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // If not logged in and not on a public route, render nothing (redirect fires above)
  if (!user && !isPublic) {
    return null;
  }

  return <>{children}</>;
}
