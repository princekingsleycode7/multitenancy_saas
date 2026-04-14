import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToastStore } from '../store/toastStore';

export default function Staff() {
  const { supabase, orgCode, role } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);
  const { addToast } = useToastStore();

  useEffect(() => {
    const fetchStaff = async () => {
      const { data } = await supabase.from('staff_profiles').select('*').eq('org_id', orgCode);
      setStaff(data || []);
    };
    fetchStaff();
  }, [supabase, orgCode]);

  const inviteStaff = async () => {
    // Simulate Kinde API call
    addToast('Staff invited successfully', 'success');
  };

  if (role !== 'owner') return <div>Access Denied</div>;

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <button onClick={inviteStaff} className="bg-blue-600 text-white px-4 py-2 rounded">Invite Staff</button>
      </header>
      
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Role</th>
            <th className="p-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {staff.map(s => (
            <tr key={s.id} className="border-t">
              <td className="p-4">{s.full_name}</td>
              <td className="p-4">{s.email}</td>
              <td className="p-4">{s.role}</td>
              <td className="p-4">{s.is_active ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
