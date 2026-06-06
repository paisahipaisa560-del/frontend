import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronLeft, ChevronRight, User, DollarSign, Clock, AlertCircle, Banknote, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { SkeletonList } from '../../components/ui/Skeleton';

export default function WithdrawManagement() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const limit = 15;

  const fetchData = () => {
    setLoading(true);
    api.get(`/withdraw/all?page=${page}&limit=${limit}`)
      .then(({ data }) => data.success && (setWithdrawals(data.data), setTotal(data.total)))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleAction = async (id, action) => {
    if (!window.confirm(`${action === 'approve' ? 'Mark as Paid' : 'Reject'} this withdrawal?`)) return;
    try {
      const { data } = await api.put(`/withdraw/${id}/${action}`, {});
      if (data.success) { toast.success(`Withdrawal ${action === 'approve' ? 'marked as paid' : 'rejected'}!`); setSelected(null); fetchData(); }
      else toast.error(data.message);
    } catch { toast.error('Failed'); }
  };

  const totalPages = Math.ceil(total / limit);

  const statusBadge = (status) => {
    if (status === 'pending') return <span className="text-[10px] text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle size={10} />Under Review</span>;
    if (status === 'approved') return <span className="text-[10px] text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-full">Paid</span>;
    return <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Rejected</span>;
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Banknote size={18} className="text-neon-green" />
        <h1 className="text-lg font-bold">Withdrawal Management</h1>
      </div>

      <div className="glass-card rounded-xl p-3">
        {loading ? (
          <SkeletonList rows={6} />
        ) : withdrawals.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-8">No withdrawals</div>
        ) : (
          <div className="grid gap-2">
            {withdrawals.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(w)}
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-3 cursor-pointer hover:border-neon-green/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-neon-green/10 flex items-center justify-center">
                      <User size={14} className="text-neon-green" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">{w.full_name}</p>
                      <p className="text-gray-600 text-[10px]">{w.mobile || w.email}</p>
                    </div>
                  </div>
                  {statusBadge(w.status)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-red-400 text-sm font-orbitron font-bold">₹{parseFloat(w.amount).toLocaleString('en-IN')}</span>
                    <span className="text-gray-600 text-[10px] flex items-center gap-1"><Clock size={10} />{new Date(w.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-600" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-neon/10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-dark p-1.5 rounded-lg disabled:opacity-30"><ChevronLeft size={14} /></button>
            <span className="text-xs text-gray-500">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="btn-dark p-1.5 rounded-lg disabled:opacity-30"><ChevronRight size={14} /></button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold flex items-center gap-2"><Banknote size={16} className="text-neon-green" />Withdrawal Details</h2>
                <button onClick={() => setSelected(null)} className="btn-dark p-1.5 rounded-lg"><X size={14} /></button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center">
                    <User size={18} className="text-neon-green" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{selected.full_name}</p>
                    <p className="text-gray-500">{selected.email}</p>
                    <p className="text-gray-500">{selected.mobile || 'No mobile'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-[#0a0a0a] rounded-xl">
                    <p className="text-gray-600 mb-1 flex items-center gap-1"><DollarSign size={12} />Amount</p>
                    <p className="text-red-400 font-orbitron font-bold text-sm">₹{parseFloat(selected.amount).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-3 bg-[#0a0a0a] rounded-xl">
                    <p className="text-gray-600 mb-1 flex items-center gap-1"><Clock size={12} />Date</p>
                    <p className="text-white">{new Date(selected.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <div className="p-3 bg-[#0a0a0a] rounded-xl">
                  <p className="text-gray-600 mb-2 flex items-center gap-1"><CreditCard size={12} />Bank Details</p>
                  {selected.holder_name ? (
                    <div className="space-y-1 text-gray-300">
                      <p><span className="text-gray-600">Holder:</span> {selected.holder_name}</p>
                      <p><span className="text-gray-600">A/c:</span> {selected.account_number}</p>
                      <p><span className="text-gray-600">IFSC:</span> {selected.ifsc_code}</p>
                      <p><span className="text-gray-600">Bank:</span> {selected.bank_name}</p>
                      {selected.upi_id && <p><span className="text-gray-600">UPI:</span> {selected.upi_id}</p>}
                    </div>
                  ) : (
                    <p className="text-gray-500">No bank account linked</p>
                  )}
                </div>

                <div className="p-3 bg-[#0a0a0a] rounded-xl">
                  <p className="text-gray-600 mb-1">Status</p>
                  <div>{statusBadge(selected.status)}</div>
                </div>
              </div>

              {selected.status === 'pending' && (
                <div className="flex gap-2 mt-5">
                  <button onClick={() => handleAction(selected.id, 'approve')}
                    className="flex-1 bg-neon-green/10 border border-neon-green/30 text-neon-green rounded-xl py-3 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <Check size={14} />Mark as Paid
                  </button>
                  <button onClick={() => handleAction(selected.id, 'reject')}
                    className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl py-3 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <X size={14} />Reject Withdrawal
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
