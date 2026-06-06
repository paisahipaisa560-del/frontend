import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Users, Copy, Check, TrendingUp, Crown, Share2, Link2, UserPlus, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ListSkeleton } from '../../components/ui/Skeleton';

export default function ReferEarn() {
  const { user } = useAuth();
  const [info, setInfo] = useState({ referralCode: '', referralEarnings: 0, totalReferrals: 0 });
  const [team, setTeam] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/referral/info').then(({ data }) => data.success && setInfo(data.data)).catch(() => {}),
      api.get('/referral/team').then(({ data }) => data.success && setTeam(data.data)).catch(() => {}),
      api.get('/referral/leaderboard').then(({ data }) => data.success && setLeaderboard(data.data)).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  const refLink = `${window.location.origin}/register?ref=${info.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(info.referralCode);
    setCodeCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  if (loading) return <div className="p-3 max-w-lg mx-auto"><ListSkeleton /></div>;

  return (
    <div className="p-3 space-y-3 max-w-lg mx-auto">
      {/* ===== HERO ===== */}
      <div className="glass-card rounded-2xl p-5 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-green/[0.04] via-transparent to-yellow-500/[0.02]" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-white text-base font-bold">Refer & Earn</h1>
              <p className="text-gray-500 text-xs mt-0.5">Invite friends, earn rewards</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 flex items-center justify-center border border-yellow-500/10">
              <Award size={20} className="text-yellow-400" />
            </div>
          </div>
          <div className="glass rounded-xl p-3.5 border border-neon-green/10 bg-neon-green/[0.02]">
            <p className="text-xs text-gray-400 mb-1">You earn per referral</p>
            <p className="font-orbitron text-2xl font-bold neon-text">₹50</p>
            <p className="text-gray-600 text-[10px] mt-1">Unlimited referrals · instant credit</p>
          </div>
        </div>
      </div>

      {/* ===== STATS ROW ===== */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-xl p-3 text-center">
          <Users size={16} className="text-blue-400 mx-auto mb-1.5" />
          <p className="font-orbitron text-white text-sm font-bold">{info.totalReferrals || 0}</p>
          <p className="text-gray-600 text-[9px] uppercase tracking-wider mt-0.5">Referrals</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <TrendingUp size={16} className="text-neon-green mx-auto mb-1.5" />
          <p className="font-orbitron text-neon-green text-sm font-bold">₹{parseFloat(info.referralEarnings || 0).toLocaleString('en-IN')}</p>
          <p className="text-gray-600 text-[9px] uppercase tracking-wider mt-0.5">Earnings</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <Gift size={16} className="text-yellow-400 mx-auto mb-1.5" />
          <p className="font-orbitron text-yellow-400 text-sm font-bold">{info.referralCode}</p>
          <p className="text-gray-600 text-[9px] uppercase tracking-wider mt-0.5">Your Code</p>
        </div>
      </div>

      {/* ===== REFERRAL LINK ===== */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={14} className="text-neon-green" />
          <span className="text-white text-[10px] font-bold uppercase tracking-wider">Share Your Link</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <code className="flex-1 font-orbitron text-[10px] text-neon-green bg-black/40 rounded-xl px-3.5 py-3 border border-neon-green/10 truncate">
            {refLink}
          </code>
          <button onClick={copyLink} className="btn-neon p-3 rounded-xl shrink-0">
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <code className="font-orbitron text-[10px] text-yellow-400 bg-black/40 rounded-lg px-3 py-1.5 border border-yellow-500/10">
            {info.referralCode}
          </code>
          <button onClick={copyCode} className="text-gray-500 hover:text-white p-1 transition-colors">
            {codeCopied ? <Check size={12} className="text-neon-green" /> : <Copy size={12} />}
          </button>
          <span className="text-gray-600 text-[9px]">Referral code</span>
        </div>
      </div>

      {/* ===== TEAM + LEADERBOARD ===== */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-neon-green" />
          <span className="text-white text-[10px] font-bold uppercase tracking-wider">Your Team</span>
          <span className="text-gray-600 text-[10px] ml-auto">{info.totalReferrals || 0} members</span>
        </div>
        {team.length === 0 ? (
          <div className="text-center py-6">
            <UserPlus size={28} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-600 text-xs">No referrals yet</p>
            <p className="text-gray-700 text-[10px] mt-0.5">Share your link to grow your team!</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scroll">
            {team.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="glass rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-neon-green/10 flex items-center justify-center">
                    <span className="text-neon-green text-[10px] font-bold font-orbitron">
                      {t.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <span className="text-white text-xs">{t.full_name}</span>
                </div>
                <span className="text-gray-500 text-[10px]">{t.join_date ? new Date(t.join_date).toLocaleDateString('en-IN') : ''}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ===== LEADERBOARD ===== */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Crown size={14} className="text-yellow-400" />
          <span className="text-white text-[10px] font-bold uppercase tracking-wider">Leaderboard</span>
        </div>
        {leaderboard.length === 0 ? (
          <div className="text-center py-6">
            <Crown size={28} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-600 text-xs">Be the first referrer!</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scroll">
            {leaderboard.map((l, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className={`glass rounded-xl px-3.5 py-2.5 flex items-center justify-between ${i === 0 ? 'border border-yellow-500/10 bg-yellow-500/[0.02]' : ''}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-orbitron text-[10px] font-bold ${
                    i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/10 text-gray-400' : i === 2 ? 'bg-orange-500/10 text-orange-400' : 'bg-white/5 text-gray-600'
                  }`}>
                    #{i + 1}
                  </div>
                  <div>
                    <p className="text-white text-xs">{l.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={10} className="text-gray-500" />
                  <span className="text-gray-400 text-[10px] font-orbitron">{l.total_referrals}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
