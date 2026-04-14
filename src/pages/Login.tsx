import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function Login() {
  const { login, register, isAuthenticated, isLoading } = useKindeAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/pos');
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="hidden md:flex flex-1 bg-gray-900 text-white p-12 flex-col justify-center">
        <h1 className="text-4xl font-bold mb-4">DigiKing POS</h1>
        <p className="text-xl text-gray-400 mb-8">The smarter POS for Nigerian businesses</p>
        <ul className="space-y-4 text-lg">
          <li>✓ Fast checkout</li>
          <li>✓ Multi-tenant</li>
          <li>✓ Offline-ready</li>
        </ul>
      </div>
      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-gray-600 mb-8">Sign in to your DigiKing account</p>
          <button 
            onClick={() => login()} 
            disabled={isLoading}
            className="w-full bg-gray-900 text-white p-3 rounded mb-4 hover:bg-gray-800 disabled:opacity-50"
          >
            Sign In
          </button>
          <button 
            onClick={() => register()} 
            disabled={isLoading}
            className="w-full border border-gray-300 text-gray-700 p-3 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Register your business
          </button>
        </div>
      </div>
    </div>
  );
}
