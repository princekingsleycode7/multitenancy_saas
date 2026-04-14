import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOffline } from '../hooks/useOffline';
import { LayoutDashboard, ShoppingCart, BarChart3, Users, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Navbar = () => {
  const { role, user, supabase, orgCode } = useAuth();
  const { isOnline } = useOffline();
  const location = useLocation();
  const [plan, setPlan] = useState('Starter');

  useEffect(() => {
    const fetchPlan = async () => {
      const { data } = await supabase.from('tenants').select('plan').eq('org_id', orgCode).single();
      if (data) setPlan(data.plan);
    };
    if (supabase && orgCode) fetchPlan();
  }, [supabase, orgCode]);

  const navItems = [
    { name: 'POS', path: '/app/pos', icon: ShoppingCart, roles: ['owner', 'manager', 'cashier'] },
    { name: 'Inventory', path: '/app/inventory', icon: LayoutDashboard, roles: ['owner', 'manager'] },
    { name: 'Reports', path: '/app/reports', icon: BarChart3, roles: ['owner', 'manager'] },
    { name: 'Staff', path: '/app/staff', icon: Users, roles: ['owner'] },
    { name: 'Settings', path: '/app/settings', icon: Settings, roles: ['owner'] },
  ];

  return (
    <nav className="bg-white border-b p-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <h1 className="font-bold text-xl">DigiKing POS</h1>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{plan}</span>
        {!isOnline && <span className="text-red-500 text-xs font-bold flex items-center gap-1">● Offline</span>}
        {navItems.filter(item => item.roles.includes(role || '')).map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex items-center gap-2 ${location.pathname === item.path ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
          >
            <item.icon size={18} />
            {item.name}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <span>{user?.email}</span>
        <button onClick={() => window.location.href = '/api/logout'} className="text-red-600"><LogOut size={18} /></button>
      </div>
    </nav>
  );
};
