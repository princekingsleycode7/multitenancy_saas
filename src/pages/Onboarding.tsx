import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { supabase, orgCode } = useAuth();
  const navigate = useNavigate();

  const [business, setBusiness] = useState({ name: '', phone: '', address: '', currency: 'NGN', tax: 7.5 });

  const handleBusinessSubmit = async () => {
    await supabase.from('tenants').update({
      business_name: business.name,
      // ... other fields
    }).eq('org_id', orgCode);
    setStep(2);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span>Step {step} of 3</span>
          <span>{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Business Setup</h2>
          <input type="text" placeholder="Business Name" className="w-full p-2 border" onChange={(e) => setBusiness({...business, name: e.target.value})} />
          <button onClick={handleBusinessSubmit} className="bg-blue-600 text-white p-2 rounded">Next</button>
        </div>
      )}
      
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Add Products</h2>
          <button onClick={() => setStep(3)} className="bg-blue-600 text-white p-2 rounded">Next</button>
          <button onClick={() => setStep(3)} className="text-gray-500">Skip</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Invite Staff</h2>
          <button onClick={async () => {
            await supabase.from('tenants').update({ onboarding_complete: true }).eq('org_id', orgCode);
            navigate('/app/pos');
          }} className="bg-blue-600 text-white p-2 rounded">Complete</button>
        </div>
      )}
    </div>
  );
}
