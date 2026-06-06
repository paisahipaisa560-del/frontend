import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Banknote, ArrowLeftRight, TrendingUp, Clock, Gamepad2, UserPlus, DollarSign } from 'lucide-react';
import api from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => {
      if (data.success) setStats(data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Deposits', value: `₹${(stats?.totalDeposits || 0).toLocaleString('en-IN')}`, icon: Banknote, color: 'text-neon-green', bg: 'bg-neon-green/10' },
    { label: 'Total Withdrawals', value: `₹${(stats?.totalWithdrawals || 0).toLocaleString('en-IN')}`, icon: ArrowLeftRight, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Profit', value: `₹${(stats?.profit || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Total Bets', value: stats?.totalBets || 0, icon: Gamepad2, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Pending Dep.', value: stats?.pendingDeposits || 0, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Pending With.', value: stats?.pendingWithdrawals || 0, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp size={18} className="text-neon-green" />
        <h1 className="text-lg font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {cards.map((c, i) => (
          <div key={i} className="glass-card rounded-xl p-3 animate-in">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`p-1.5 rounded-lg ${c.bg}`}><c.icon size={14} className={c.color} /></div>
              <span className="text-gray-500 text-[10px] uppercase">{c.label}</span>
            </div>
            <p className={`font-orbitron text-base md:text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div className="glass-card rounded-xl p-3">
        <h3 className="text-white text-xs font-bold mb-2 flex items-center gap-1.5">
          <UserPlus size={13} className="text-neon-green" /> Recent Users
        </h3>
        <div className="table-wrap">
          <table className="table-neon">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Balance</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {(stats?.recentUsers || []).map(u => (
                <tr key={u.id}>
                  <td className="text-white text-xs font-medium">{u.full_name}</td>
                  <td className="text-gray-400 text-xs">{u.email}</td>
                  <td className="text-neon-green text-xs font-orbitron">₹{parseFloat(u.balance).toLocaleString('en-IN')}</td>
                  <td className="text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
