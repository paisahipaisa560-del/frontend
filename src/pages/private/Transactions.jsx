import { useState, useEffect } from 'react';
import { ArrowLeftRight, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { ListSkeleton } from '../../components/ui/Skeleton';

const typeColors = {
  deposit: 'text-green-400 bg-green-500/10',
  withdrawal: 'text-red-400 bg-red-500/10',
  bet: 'text-orange-400 bg-orange-500/10',
  bet_win: 'text-neon-green bg-neon-green/10',
  bet_loss: 'text-red-400 bg-red-500/10',
  referral_bonus: 'text-blue-400 bg-blue-500/10',
  daily_bonus: 'text-cyan-400 bg-cyan-500/10',
  admin_adjustment: 'text-purple-400 bg-purple-500/10',
  withdrawal_approved: 'text-green-400 bg-green-500/10',
  withdrawal_rejected: 'text-red-400 bg-red-500/10',
  deposit_rejected: 'text-red-400 bg-red-500/10',
};

const typeLabels = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  bet: 'Bet Placed',
  bet_win: 'Bet Won',
  bet_loss: 'Bet Lost',
  referral_bonus: 'Referral Bonus',
  daily_bonus: 'Daily Bonus',
  admin_adjustment: 'Admin Adjustment',
  withdrawal_approved: 'Withdrawal Approved',
  withdrawal_rejected: 'Withdrawal Rejected',
  deposit_rejected: 'Deposit Rejected',
};

const filters = ['all', 'deposit', 'withdrawal', 'bet_win', 'bet'];

export default function Transactions() {
  const [txns, setTxns] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const limit = 15;

  useEffect(() => {
    setLoading(true);
    api.get(`/transactions?page=${page}&limit=${limit}&type=${filter}`)
      .then(({ data }) => data.success && (setTxns(data.data), setTotal(data.total)))
      .catch(() => {}).finally(() => setLoading(false));
  }, [page, filter]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-2 md:p-3 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <ArrowLeftRight size={18} className="text-neon-green" />
        <h1 className="text-base md:text-lg font-bold">Transactions</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
              filter === f ? 'btn-neon' : 'btn-dark'
            }`}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="glass-card rounded-xl p-3">
        {loading ? (
          <ListSkeleton />
        ) : txns.length === 0 ? (
          <p className="text-gray-600 text-xs text-center py-8">No transactions found</p>
        ) : (
          <div className="space-y-1.5">
            {txns.map((t, i) => (
              <div key={t.id || i} className="glass rounded-lg px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${(typeColors[t.type] || 'bg-gray-500/10 text-gray-400').split(' ').slice(1).join(' ')}`}>
                    <span className="text-[10px] font-bold">{t.type === 'deposit' || t.type === 'bet_win' || t.type === 'referral_bonus' || t.type === 'daily_bonus' ? '+' : '-'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{typeLabels[t.type] || t.type}</p>
                    <p className="text-gray-600 text-[10px] truncate">{t.description || ''}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`font-orbitron text-xs font-bold ${t.amount > 0 && (t.type === 'deposit' || t.type === 'bet_win' || t.type === 'referral_bonus' || t.type === 'daily_bonus') ? 'text-neon-green' : t.type.includes('bet') && t.amount > 0 && t.type !== 'bet_win' ? 'text-red-400' : 'text-gray-300'}`}>
                    {t.amount > 0 && (t.type === 'deposit' || t.type === 'bet_win' || t.type === 'referral_bonus' || t.type === 'daily_bonus') ? '+' : ''}
                    ₹{parseFloat(t.amount).toLocaleString('en-IN')}
                  </p>
                  <p className="text-gray-600 text-[10px]">{new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-neon/10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-dark p-1.5 rounded-lg disabled:opacity-30"><ChevronLeft size={14} /></button>
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="btn-dark p-1.5 rounded-lg disabled:opacity-30"><ChevronRight size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
