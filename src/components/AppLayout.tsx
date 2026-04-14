import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { useToastStore } from '../store/toastStore';
import { useOffline } from '../hooks/useOffline';

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { toasts } = useToastStore();
  const { isOnline } = useOffline();

  return (
    <div className="min-h-screen bg-gray-50">
      {!isOnline && (
        <div className="bg-yellow-500 text-white text-center p-2 text-sm font-bold">
          You're offline — POS is still available
        </div>
      )}
      <Navbar />
      <main className="p-6">{children}</main>
      
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`p-4 rounded shadow ${toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};
