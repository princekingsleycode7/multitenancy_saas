import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSessionStore } from '../store/sessionStore';
import { Navigate } from 'react-router-dom';

export default function Inventory() {
  const { supabase, getPermission, orgCode } = useAuth();
  const { selectedOutletId } = useSessionStore();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  if (!getPermission('manage:inventory')) {
    return <Navigate to="/app/pos" />;
  }

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*, outlet_stock!inner(stock)')
        .eq('org_id', orgCode)
        .eq('outlet_stock.outlet_id', selectedOutletId);
      setProducts(data || []);
      setLoading(false);
    };
    if (supabase && orgCode && selectedOutletId) fetchProducts();
  }, [supabase, orgCode, selectedOutletId]);

  const stats = {
    total: products.length,
    value: products.reduce((acc, p) => acc + (p.cost_price || 0) * p.outlet_stock[0].stock, 0),
    lowStock: products.filter(p => p.outlet_stock[0].stock <= p.low_stock_threshold).length,
    outOfStock: products.filter(p => p.outlet_stock[0].stock === 0).length,
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Product</button>
          <button className="bg-gray-200 px-4 py-2 rounded">Export CSV</button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">Total Products: {stats.total}</div>
        <div className="bg-white p-4 rounded shadow">Total Stock Value: {stats.value}</div>
        <div className="bg-white p-4 rounded shadow">Low Stock: {stats.lowStock}</div>
        <div className="bg-white p-4 rounded shadow">Out of Stock: {stats.outOfStock}</div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <input type="text" placeholder="Search products..." className="p-2 border rounded w-full" />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.outlet_stock[0].stock}</td>
                <td>{p.outlet_stock[0].stock === 0 ? 'Out of Stock' : p.outlet_stock[0].stock <= p.low_stock_threshold ? 'Low Stock' : 'Active'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
