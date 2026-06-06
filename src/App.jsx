import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import Dashboard from './pages/private/Dashboard';
import AviatorGame from './pages/private/AviatorGame';
import Deposit from './pages/private/Deposit';
import Withdraw from './pages/private/Withdraw';
import ReferEarn from './pages/private/ReferEarn';
import ManageAccount from './pages/private/ManageAccount';
import Transactions from './pages/private/Transactions';
import Profile from './pages/private/Profile';
import Support from './pages/private/Support';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DepositManagement from './pages/admin/DepositManagement';
import WithdrawManagement from './pages/admin/WithdrawManagement';
import AdminSettings from './pages/admin/AdminSettings';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { admin } = useAuth();
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/game" element={<PrivateRoute><Layout><AviatorGame /></Layout></PrivateRoute>} />
      <Route path="/deposit" element={<PrivateRoute><Layout><Deposit /></Layout></PrivateRoute>} />
      <Route path="/withdraw" element={<PrivateRoute><Layout><Withdraw /></Layout></PrivateRoute>} />
      <Route path="/refer-earn" element={<PrivateRoute><Layout><ReferEarn /></Layout></PrivateRoute>} />
      <Route path="/manage-account" element={<PrivateRoute><Layout><ManageAccount /></Layout></PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute><Layout><Transactions /></Layout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
      <Route path="/support" element={<PrivateRoute><Layout><Support /></Layout></PrivateRoute>} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminLayout><UserManagement /></AdminLayout></AdminRoute>} />
      <Route path="/admin/deposits" element={<AdminRoute><AdminLayout><DepositManagement /></AdminLayout></AdminRoute>} />
      <Route path="/admin/withdrawals" element={<AdminRoute><AdminLayout><WithdrawManagement /></AdminLayout></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
