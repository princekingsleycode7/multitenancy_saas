import { useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';

export default function Callback() {
  const { isAuthenticated, isLoading } = useKindeAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/app/pos', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
