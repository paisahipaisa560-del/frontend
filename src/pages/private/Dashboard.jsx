import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Copy, Check, TrendingUp, TrendingDown, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import LivePlayersTable from '../../components/LivePlayersTable';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user/balance').then(({ data }) => data.success && setBalance(data.data.balance))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const copyCode = () => {
    const code = user?.referral_code || 'N/A';
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const firstName = user?.full_name?.split(' ')[0] || 'User';
  const bal = parseFloat(balance);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-2 md:p-3 space-y-2.5">
      {/* Welcome Card */}
      <div className="glass-card rounded-2xl p-4 neon-border">
        <p className="text-gray-500 text-xs">Good to see you,</p>
        <div className="flex items-center gap-2 mt-1 mb-0.5">
          <h1 className="text-xl md:text-2xl font-bold">
            <span className="neon-text">{firstName}</span>
          </h1>
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Plane size={18} className="text-neon-green drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]" />
          </motion.div>
        </div>
        <p className="text-gray-500 text-xs">Ready to make this one count?</p>
      </div>

      {/* Banner */}
      <div className="rounded-2xl overflow-hidden">
        <img src="/banner.png" alt="Paisa Hi Paisa Banner" className="w-full h-auto object-cover"
          onError={(e) => { e.target.style.display = 'none'; }} />
      </div>

      {/* Balance + Referral Card */}
      <div className="glass-card rounded-2xl p-4 neon-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-500 text-xs uppercase tracking-wider">Current Balance</span>
          <Wallet size={16} className="text-neon-green" />
        </div>
        <p className="font-orbitron text-2xl md:text-3xl neon-text font-bold neon-text mb-3">
          ₹{bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 glass rounded-xl px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-[10px] uppercase">Referral Code</p>
              <code className="font-orbitron text-neon-green text-xs">{user?.referral_code || 'N/A'}</code>
            </div>
            <button onClick={copyCode} className="btn-dark p-2 rounded-lg">
              {copied ? <Check size={14} className="text-neon-green" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => navigate('/deposit')} className="btn-neon flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
            <TrendingUp size={16} /> Deposit
          </button>
          <button onClick={() => navigate('/withdraw')} className="btn-dark flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
            <TrendingDown size={16} /> Withdraw
          </button>
        </div>
      </div>

      {/* Live Players Table */}
      <LivePlayersTable visible={8} />


    </div>
  );
}
