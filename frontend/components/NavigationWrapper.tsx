'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

const HIDE_NAV_ROUTES = ['/login', '/signup'];

export default function NavigationWrapper() {
  const pathname = usePathname();
  const hideNav = HIDE_NAV_ROUTES.some((route) => pathname.startsWith(route));

  if (hideNav) return null;
  return <Navigation />;
}
