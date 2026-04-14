import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useAuth } from './useAuth';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { supabase, orgCode } = useAuth();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic health check
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/health');
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isOnline && orgCode) {
      syncOfflineSales();
    }
  }, [isOnline, orgCode]);

  const syncOfflineSales = async () => {
    const offlineSales = await db.offline_sales.where('org_id').equals(orgCode!).toArray();
    if (offlineSales.length === 0) return;

    console.log(`Syncing ${offlineSales.length} offline sales...`);
    
    for (const sale of offlineSales) {
      const { error } = await supabase.from('sales').insert(sale.sale_data);
      if (!error) {
        await db.offline_sales.delete(sale.id!);
      } else {
        console.error('Failed to sync sale', error);
      }
    }
  };

  return { isOnline };
}
