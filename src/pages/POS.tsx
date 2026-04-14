import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOffline } from '../hooks/useOffline';
import { useSessionStore } from '../store/sessionStore';
import { db } from '../lib/db';

export default function POS() {
  const { supabase, orgCode } = useAuth();
  const { isOnline } = useOffline();
  const { selectedOutletId } = useSessionStore();
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cardOption, setCardOption] = useState('terminal');
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*, outlet_stock!inner(stock)')
        .eq('org_id', orgCode)
        .eq('outlet_stock.outlet_id', selectedOutletId);
      setProducts(data || []);
    };
    if (supabase && orgCode && selectedOutletId) fetchProducts();
  }, [supabase, orgCode, selectedOutletId]);

  const handleCompleteSale = async (saleData: any, items: any[]) => {
    if (isOnline) {
      const { data: sale } = await supabase.from('sales').insert({ ...saleData, outlet_id: selectedOutletId }).select().single();
      for (const item of items) {
        await supabase.from('sale_items').insert({ ...item, sale_id: sale.id });
        await (supabase as any).rpc('decrement_stock', { p_id: item.product_id, o_id: selectedOutletId, qty: item.qty }, null);
      }
    } else {
      await db.offline_sales.add({
        org_id: orgCode!,
        sale_data: { ...saleData, outlet_id: selectedOutletId, items },
        created_at: Date.now(),
      });
    }
  };

  const handleChargeTerminal = async () => {
    setShowTerminalModal(true);
    // Start polling
    const interval = setInterval(async () => {
      const response = await fetch(`/api/moniepoint/status/sale-123`);
      const data = await response.json();
      if (data.status === 'approved') {
        clearInterval(interval);
        setShowTerminalModal(false);
        handleCompleteSale({ amount: 1000, status: 'completed' });
      }
    }, 3000);
    setTimeout(() => clearInterval(interval), 90000); // 90s timeout
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">POS</h1>
      <div className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block font-bold mb-2">Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-2 border rounded">
            <option>Cash</option>
            <option>Card</option>
          </select>
        </div>
        
        {paymentMethod === 'Card' && (
          <div className="mb-4 space-y-2">
            <label className="flex items-center gap-2"><input type="radio" value="terminal" checked={cardOption === 'terminal'} onChange={() => setCardOption('terminal')} /> Moniepoint Terminal</label>
            <label className="flex items-center gap-2"><input type="radio" value="manual" checked={cardOption === 'manual'} onChange={() => setCardOption('manual')} /> Manual Reference</label>
            
            {cardOption === 'terminal' && <button onClick={handleChargeTerminal} className="bg-blue-600 text-white p-2 rounded">Charge Terminal</button>}
            {cardOption === 'manual' && <input type="text" placeholder="Enter Reference" className="w-full p-2 border rounded" />}
          </div>
        )}
      </div>

      {showTerminalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-xl font-bold mb-4">Waiting for terminal...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-4xl font-bold">₦1,000</p>
          </div>
        </div>
      )}
    </div>
  );
}
