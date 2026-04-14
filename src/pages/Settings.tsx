import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToastStore } from '../store/toastStore';

export default function Settings() {
  const { role, supabase, orgCode, user, getFeatureFlag } = useAuth();
  const [activeTab, setActiveTab] = useState('business');
  const [tenant, setTenant] = useState<any>(null);
  const [outlets, setOutlets] = useState<any[]>([]);
  const { addToast } = useToastStore();

  useEffect(() => {
    const fetchTenant = async () => {
      const { data } = await supabase.from('tenants').select('*').eq('org_id', orgCode).single();
      setTenant(data);
    };
    fetchTenant();

    const fetchOutlets = async () => {
      const { data } = await supabase.from('outlet_settings').select('*').eq('org_id', orgCode);
      setOutlets(data || []);
    };
    if (getFeatureFlag('multi_outlet')) fetchOutlets();

    const urlParams = new URLSearchParams(window.location.search);
    const trxref = urlParams.get('trxref');
    if (trxref) {
      const verify = async () => {
        const response = await fetch(`/api/paystack/verify/${trxref}`);
        const data = await response.json();
        if (data.status && data.data.status === 'success') {
          await supabase.from('tenants').update({ plan: data.data.metadata.plan }).eq('org_id', orgCode);
          addToast('Subscription upgraded successfully', 'success');
        } else {
          addToast('Payment verification failed', 'error');
        }
      };
      verify();
    }
  }, [supabase, orgCode, getFeatureFlag]);

  const handleAddOutlet = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { error } = await supabase.from('outlet_settings').insert({
      org_id: orgCode,
      outlet_name: formData.get('name'),
      slug: formData.get('slug'),
      address: formData.get('address'),
    });
    if (error) addToast('Failed to add outlet', 'error');
    else {
      addToast('Outlet added', 'success');
      e.target.reset();
      const { data } = await supabase.from('outlet_settings').select('*').eq('org_id', orgCode);
      setOutlets(data || []);
    }
  };

  const handleUpgrade = async (plan: string, amount: number) => {
    const response = await fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user?.email,
        amount: amount * 100, // kobo
        metadata: { org_id: orgCode, plan },
        callback_url: `${window.location.origin}/app/settings`
      })
    });
    const data = await response.json();
    if (data.status) {
      window.location.href = data.data.authorization_url;
    } else {
      addToast('Failed to initialize payment', 'error');
    }
  };

  if (role !== 'owner') return <div>Access Denied</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="flex gap-4 mb-6 border-b">
        {['business', 'outlets', 'subscription', 'danger'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`capitalize pb-2 ${activeTab === tab ? 'border-b-2 border-blue-600 font-bold' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="bg-white p-6 rounded shadow">
        {activeTab === 'business' && <div>Business Settings Form</div>}
        {activeTab === 'outlets' && getFeatureFlag('multi_outlet') && (
          <div>
            <h2 className="text-xl font-bold mb-4">Outlets</h2>
            <form onSubmit={handleAddOutlet} className="mb-6 grid grid-cols-3 gap-2">
              <input name="name" placeholder="Outlet Name" className="p-2 border rounded" required />
              <input name="slug" placeholder="Slug (e.g. main-branch)" className="p-2 border rounded" required />
              <input name="address" placeholder="Address" className="p-2 border rounded" />
              <button className="bg-blue-600 text-white p-2 rounded">Add Outlet</button>
            </form>
            <div className="space-y-2">
              {outlets.map(o => (
                <div key={o.id} className="border p-2 rounded flex justify-between">
                  <span>{o.outlet_name} ({o.slug})</span>
                  <span>{o.address}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'subscription' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Current Plan: {tenant?.plan || 'Starter'}</h2>
            <div className="grid grid-cols-3 gap-4">
              {[{name: 'Starter', price: 0}, {name: 'Pro', price: 15000}, {name: 'Enterprise', price: 35000}].map(p => (
                <div key={p.name} className="border p-4 rounded">
                  <h3 className="font-bold">{p.name}</h3>
                  <p>₦{p.price}/month</p>
                  <button onClick={() => handleUpgrade(p.name, p.price)} className="bg-blue-600 text-white p-2 rounded mt-2">Upgrade</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'danger' && <div>Danger Zone</div>}
      </div>
    </div>
  );
}
