import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSessionStore } from '../store/sessionStore';
import { db } from '../lib/db';

export default function OutletSelector() {
  const { supabase, orgCode } = useAuth();
  const { setSelectedOutletId } = useSessionStore();
  const navigate = useNavigate();
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOutlets() {
      const { data, error } = await supabase
        .from('outlet_settings')
        .select('*')
        .eq('org_id', orgCode);
      
      if (data) {
        setOutlets(data);
        if (data.length === 1) {
          setSelectedOutletId(data[0].id);
          navigate('/app/pos');
        }
      }
      setLoading(false);
    }
    fetchOutlets();
  }, [supabase, orgCode, setSelectedOutletId, navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Select Outlet</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {outlets.map((outlet) => (
          <button
            key={outlet.id}
            onClick={() => {
              setSelectedOutletId(outlet.id);
              navigate('/app/pos');
            }}
            className="p-6 bg-white rounded shadow hover:bg-blue-50 text-left"
          >
            <h2 className="text-xl font-bold">{outlet.outlet_name}</h2>
            <p className="text-gray-600">{outlet.address}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
