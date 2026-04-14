import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ComposedChart } from 'recharts';

export default function Reports() {
  const { supabase, orgCode } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>(null);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      let query = supabase.from('sales').select('*, sale_items(*)').eq('org_id', orgCode);
      if (selectedOutlet !== 'all') {
        query = query.eq('outlet_id', selectedOutlet);
      }
      const { data: sales } = await query;
      setData(sales || []);
      
      const { data: t } = await supabase.from('tenants').select('plan').eq('org_id', orgCode).single();
      setTenant(t);

      const { data: o } = await supabase.from('outlet_settings').select('*').eq('org_id', orgCode);
      setOutlets(o || []);
    };
    fetchData();
  }, [supabase, orgCode, selectedOutlet]);

  if (tenant?.plan === 'Starter') {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Advanced Reports</h2>
        <p>Upgrade to Pro to access advanced reports.</p>
        <button onClick={() => window.location.href = '/app/settings?tab=subscription'} className="bg-blue-600 text-white p-2 rounded mt-4">Upgrade Now</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        <select value={selectedOutlet} onChange={(e) => setSelectedOutlet(e.target.value)} className="p-2 border rounded">
          <option value="all">All Outlets</option>
          {outlets.map(o => <option key={o.id} value={o.id}>{o.outlet_name}</option>)}
        </select>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">Total Revenue: ₦{data.reduce((acc, s) => acc + s.total, 0)}</div>
        <div className="bg-white p-4 rounded shadow">Transactions: {data.length}</div>
        <div className="bg-white p-4 rounded shadow">Avg Value: ₦{data.length ? (data.reduce((acc, s) => acc + s.total, 0) / data.length).toFixed(2) : 0}</div>
        <div className="bg-white p-4 rounded shadow">Top Product: N/A</div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow h-80">
          <h2 className="font-bold mb-2">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="created_at" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow h-80">
          <h2 className="font-bold mb-2">Sales by Payment Method</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="total" nameKey="payment_method" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
