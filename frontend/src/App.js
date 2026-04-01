import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Budgets from './pages/Budgets';
import Savings from './pages/Savings';
import SaldoRekening from './pages/SaldoRekening';
import Layout from './components/layout/Layout';

const queryClient = new QueryClient();

const AppLoader = () => (
  <div style={{
    height: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 16,
    background: '#f0f2f8',
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 14,
      background: 'linear-gradient(135deg, #6366f1, #4338ca)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 24,
    }}>💰</div>
    <div style={{
      width: 32, height: 3, borderRadius: 99,
      background: 'linear-gradient(90deg, #6366f1, #818cf8)',
      animation: 'pulse 1.2s ease-in-out infinite',
    }} />
    <style>{`@keyframes pulse { 0%,100%{opacity:.4;transform:scaleX(.6)} 50%{opacity:1;transform:scaleX(1)} }`}</style>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <AppLoader />;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <AppLoader />;
  return user ? <Navigate to="/" /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="categories" element={<Categories />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="savings" element={<Savings />} />
        <Route path="saldo-rekening" element={<SaldoRekening />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
