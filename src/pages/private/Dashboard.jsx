import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Copy, Check, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Flame, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import LivePlayersTable from '../../components/LivePlayersTable';

const typeLabels = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  bet: 'Bet Placed',
  bet_win: 'Game Win',
  bet_loss: 'Game Loss',
  referral_bonus: 'Referral Bonus',
  daily_bonus: 'Daily Bonus',
  admin_adjustment: 'Adjustment',
  withdrawal_approved: 'Withdrawal',
  withdrawal_rejected: 'Refunded',
  deposit_rejected: 'Deposit Failed',
};

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [copied, setCopied] = useState(false);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/user/balance').then(({ data }) => data.success && setBalance(data.data.balance)),
      api.get('/transactions?limit=8').then(({ data }) => data.success && setTxns(data.data))
    ]).catch(() => {}).finally(() => setLoading(false));
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

      {/* My Wallet Activity */}
      <div className="glass-card rounded-2xl p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Flame size={14} className="text-neon-green" />
          <span className="text-white text-xs font-bold uppercase tracking-wider">My Wallet Activity</span>
        </div>
        {txns.length === 0 ? (
          <p className="text-gray-600 text-xs text-center py-6">No activity yet</p>
        ) : (
          <div className="space-y-1.5">
            {txns.map((t, i) => (
              <div key={t.id || i} className="glass rounded-xl px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    t.type === 'deposit' || t.type === 'bet_win' || t.type === 'referral_bonus' || t.type === 'daily_bonus'
                      ? 'bg-neon-green/10' : 'bg-red-500/10'
                  }`}>
                    {t.type === 'deposit' || t.type === 'bet_win' || t.type === 'referral_bonus' || t.type === 'daily_bonus'
                      ? <ArrowDownLeft size={14} className="text-neon-green" />
                      : <ArrowUpRight size={14} className="text-red-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{typeLabels[t.type] || t.type}</p>
                    <p className="text-gray-600 text-[10px]">{new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <p className={`font-orbitron text-xs font-bold flex-shrink-0 ml-2 ${
                  t.type === 'deposit' || t.type === 'bet_win' || t.type === 'referral_bonus' || t.type === 'daily_bonus'
                    ? 'text-neon-green' : 'text-red-400'
                }`}>
                  {t.type === 'deposit' || t.type === 'bet_win' || t.type === 'referral_bonus' || t.type === 'daily_bonus' ? '+' : '-'}
                  ₹{parseFloat(t.amount).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
