import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Clock, CheckCircle2, XCircle, Wallet, AlertTriangle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { FormSkeleton } from '../../components/ui/Skeleton';

export default function Withdraw() {
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [hasBank, setHasBank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/withdraw').then(({ data }) => data.success && setWithdrawals(data.data)).catch(() => {}),
      api.get('/bank/account').then(({ data }) => setHasBank(data.success && !!data.data)).catch(() => setHasBank(false))
    ]).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt < 100) return toast.error('Minimum withdrawal is ₹100');
    if (amt > parseFloat(user?.balance || 0)) return toast.error('Insufficient balance');
    setSubmitting(true);
    try {
      const { data } = await api.post('/withdraw', { amount: amt });
      if (data.success) {
        toast.success('Withdrawal request submitted!');
        setAmount('');
        await refreshUser();
        const res = await api.get('/withdraw');
        if (res.data.success) setWithdrawals(res.data.data);
      } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const statusBadge = (s) => {
    if (s === 'approved') return <span className="flex items-center gap-1 text-[10px] text-green-400"><CheckCircle2 size={10} />Paid</span>;
    if (s === 'rejected') return <span className="flex items-center gap-1 text-[10px] text-red-400"><XCircle size={10} />Rejected</span>;
    return <span className="flex items-center gap-1 text-[10px] text-yellow-400"><Clock size={10} />Under Review</span>;
  };

  const bal = parseFloat(user?.balance || 0);

  if (loading) return <FormSkeleton />;

  return (
    <div className="p-2 md:p-3 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard size={18} className="text-neon-green" />
        <h1 className="text-base md:text-lg font-bold">Withdraw</h1>
      </div>

      {hasBank === false && (
        <div className="glass-card rounded-xl p-3 border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-yellow-400 text-xs font-bold mb-0.5">Bank account required</p>
              <p className="text-gray-400 text-[10px] mb-2">Add your bank account details before withdrawing</p>
              <Link to="/manage-account" className="btn-neon inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                <Building2 size={12} /> Add Bank Account
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Form */}
        <div className="space-y-2">
          <div className="glass-card rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Available Balance</span>
              <Wallet size={14} className="text-neon-green" />
            </div>
            <p className="font-orbitron text-neon-green text-lg font-bold">
              ₹{bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card rounded-xl p-3 space-y-2.5">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount" min="100" className="input-neon rounded-lg px-3 py-2 text-sm" />
              <p className="text-gray-600 text-[10px] mt-1">Min: ₹100 | Max: ₹1,00,000</p>
            </div>
            <div className="flex gap-1">
              {[500, 1000, 2000, 5000].map(a => (
                <button key={a} type="button" onClick={() => setAmount(a)}
                  className="btn-dark flex-1 py-1.5 rounded-lg text-[10px] font-medium">₹{a}</button>
              ))}
            </div>
            <button type="submit" disabled={submitting || !amount} className="btn-neon w-full py-2.5 rounded-lg text-sm font-bold">
              {submitting ? 'Submitting...' : 'Withdraw Now'}
            </button>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="glass-card rounded-xl p-3">
          <h3 className="text-white text-xs font-bold mb-2 flex items-center gap-1.5">
            <Clock size={13} className="text-neon-green" /> History
          </h3>
          {withdrawals.length === 0 ? (
            <p className="text-gray-600 text-xs text-center py-6">No withdrawals yet</p>
          ) : (
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
              {withdrawals.map((w, i) => (
                <div key={w.id || i} className="glass rounded-lg p-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-white text-xs font-medium">₹{parseFloat(w.amount).toLocaleString('en-IN')}</p>
                    <p className="text-gray-600 text-[10px]">{new Date(w.created_at).toLocaleDateString()}</p>
                  </div>
                  {statusBadge(w.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
