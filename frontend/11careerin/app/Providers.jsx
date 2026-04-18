'use client';

import { AuthProvider } from './context/AuthContext';
import { Toaster }      from 'react-hot-toast';

/**
 * Providers — wraps all client-side context providers.
 * We separate this from layout.tsx because layout is a Server Component
 * and we need 'use client' for React Context.
 */
export default function Providers({ children }) {
  return (
    <AuthProvider>
      {/* Toast notifications — top-right, elegant style */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color:       '#f1f5f9',
            fontFamily:  'inherit',
            fontSize:    '14px',
            fontWeight:  '500',
            borderRadius: '10px',
            padding:     '12px 16px',
            boxShadow:   '0 10px 40px rgba(0,0,0,0.25)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#f1f5f9' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
          },
        }}
      />
      {children}
    </AuthProvider>
  );
}
