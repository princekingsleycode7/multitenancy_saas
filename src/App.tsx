/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ReactNode, lazy, Suspense } from 'react';
import { OnboardingGuard } from './components/OnboardingGuard';
import { OutletGuard } from './components/OutletGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppLayout } from './components/AppLayout';

const Login = lazy(() => import('./pages/Login'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Reports = lazy(() => import('./pages/Reports'));
const Staff = lazy(() => import('./pages/Staff'));
const Settings = lazy(() => import('./pages/Settings'));
const POS = lazy(() => import('./pages/POS'));
const OutletSelector = lazy(() => import('./pages/OutletSelector'));

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <KindeProvider
      clientId={import.meta.env.VITE_KINDE_CLIENT_ID}
      domain={import.meta.env.VITE_KINDE_DOMAIN}
      redirectUri={import.meta.env.VITE_KINDE_REDIRECT_URI}
      logoutUri={import.meta.env.VITE_KINDE_LOGOUT_URI}
    >
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/callback" element={<div>Callback Handler</div>} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/app/*" element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <Routes>
                      <Route path="select-outlet" element={<OutletSelector />} />
                      <Route path="*" element={
                        <OutletGuard>
                          <AppLayout>
                            <Routes>
                              <Route path="pos" element={<POS />} />
                              <Route path="inventory" element={<Inventory />} />
                              <Route path="reports" element={<Reports />} />
                              <Route path="staff" element={<Staff />} />
                              <Route path="settings" element={<Settings />} />
                              <Route path="*" element={<Navigate to="/app/pos" />} />
                            </Routes>
                          </AppLayout>
                        </OutletGuard>
                      } />
                    </Routes>
                  </OnboardingGuard>
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/app/pos" />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </KindeProvider>
  );
}
