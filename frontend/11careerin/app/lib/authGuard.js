'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

/**
 * useAuthGuard
 * -----------
 * Call this at the top of any protected page component.
 * If the user is not logged in, they get redirected to /login automatically.
 *
 * Usage:
 *   const { user, token } = useAuthGuard();
 *   if (!user) return null; // or a loading spinner
 */
export function useAuthGuard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until localStorage has been checked
    if (loading) return;

    // If no token → send to login
    if (!token) {
      router.replace('/login');
    }
  }, [token, loading, router]);

  return { user, token, loading };
}

/**
 * useGuestGuard
 * -------------
 * Call this on login/signup pages.
 * If the user IS already logged in, redirect them to /home.
 *
 * Usage:
 *   useGuestGuard();
 */
export function useGuestGuard() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (token) {
      router.replace('/home');
    }
  }, [token, loading, router]);
}
