import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CreditCard, Smartphone, Save, Trash2, Plus, X, Edit3, Check, Banknote, User, Hash, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { FormSkeleton } from '../../components/ui/Skeleton';

export default function ManageAccount() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // form
  const [form, setForm] = useState({ holderName: '', accountNumber: '', ifscCode: '', bankName: '', upiId: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAccount = () => {
    setLoading(true);
    api.get('/bank/account').then(({ data }) => {
      if (data.success && data.data) {
        setAccount(data.data);
        setForm({
          holderName: data.data.holder_name || '',
          accountNumber: data.data.account_number || '',
          ifscCode: data.data.ifsc_code || '',
          bankName: data.data.bank_name || '',
          upiId: data.data.upi_id || '',
        });
      } else {
        setAccount(null);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAccount(); }, []);

  const update = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.holderName || !form.accountNumber || !form.ifscCode || !form.bankName)
      return toast.error('Fill all required bank fields');
    setSubmitting(true);
    try {
      const { data } = await api.put('/bank/account', form);
      if (data.success) {
        toast.success('Bank account saved!');
        setShowForm(false);
        fetchAccount();
      } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your bank account?')) return;
    setDeleting(true);
    try {
      const { data } = await api.delete('/bank/account');
      if (data.success) {
        toast.success('Bank account deleted');
        setAccount(null);
      } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="p-3 max-w-lg mx-auto"><FormSkeleton /></div>;

  return (
    <div className="p-3 space-y-3 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Building2 size={18} className="text-neon-green" />
        <h1 className="text-base md:text-lg font-bold">Bank Account</h1>
      </div>

      {account && !showForm ? (
        /* ===== ACCOUNT DETAILS VIEW ===== */
        <>
          <div className="glass-card rounded-2xl p-5 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-neon-green/5 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-green/5 flex items-center justify-center border border-neon-green/10">
                  <Banknote size={22} className="text-neon-green" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{account.holder_name}</p>
                  <p className="text-gray-500 text-xs">{account.bank_name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between glass rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-blue-400" />
                    <span className="text-gray-500 text-xs">Holder</span>
                  </div>
                  <span className="text-white text-xs font-medium">{account.holder_name}</span>
                </div>
                <div className="flex items-center justify-between glass rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Hash size={13} className="text-purple-400" />
                    <span className="text-gray-500 text-xs">Account</span>
                  </div>
                  <span className="font-orbitron text-white text-xs tracking-wider">xxxx{account.account_number?.slice(-4)}</span>
                </div>
                <div className="flex items-center justify-between glass rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Globe size={13} className="text-yellow-400" />
                    <span className="text-gray-500 text-xs">IFSC</span>
                  </div>
                  <span className="font-orbitron text-yellow-400 text-xs">{account.ifsc_code}</span>
                </div>
                <div className="flex items-center justify-between glass rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Building2 size={13} className="text-neon-green" />
                    <span className="text-gray-500 text-xs">Bank</span>
                  </div>
                  <span className="text-white text-xs font-medium">{account.bank_name}</span>
                </div>
                {account.upi_id && (
                  <div className="flex items-center justify-between glass rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <Smartphone size={13} className="text-cyan-400" />
                      <span className="text-gray-500 text-xs">UPI</span>
                    </div>
                    <span className="text-cyan-400 text-xs">{account.upi_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowForm(true)}
              className="btn-dark flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5">
              <Edit3 size={13} /> Edit
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(255,50,50,0.08)', border: '1px solid rgba(255,50,50,0.12)', color: '#ff4444' }}>
              <Trash2 size={13} /> {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>

          {/* ===== UPI INFO CARD ===== */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone size={14} className="text-cyan-400" />
              <span className="text-white text-[10px] font-bold uppercase tracking-wider">UPI Details</span>
            </div>
            <p className="text-gray-600 text-[10px] mb-3 leading-relaxed">
              Add your UPI ID for faster withdrawals. Make sure all details are correct before submitting withdrawal requests.
            </p>
            <div className="glass rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-[10px]">UPI ID</span>
                <span className="text-white text-xs font-medium">{account.upi_id || <span className="text-gray-600">Not set</span>}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-[10px]">Bank</span>
                <span className="text-white text-xs font-medium">{account.bank_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-[10px]">Account</span>
                <span className="text-white text-xs font-medium">xxxx{account.account_number?.slice(-4)}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ===== ADD / EDIT FORM ===== */
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-neon-green" />
              <h3 className="text-white text-xs font-bold uppercase tracking-wider">
                {account ? 'Edit Account' : 'Add Account'}
              </h3>
            </div>
            {account && (
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white p-1">
                <X size={16} />
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Account Holder Name *</label>
              <input type="text" value={form.holderName} onChange={update('holderName')}
                className="input-neon rounded-xl px-3.5 py-2.5 text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Account Number *</label>
              <input type="text" value={form.accountNumber} onChange={update('accountNumber')}
                className="input-neon rounded-xl px-3.5 py-2.5 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">IFSC Code *</label>
                <input type="text" value={form.ifscCode} onChange={update('ifscCode')}
                  className="input-neon rounded-xl px-3.5 py-2.5 text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Bank Name *</label>
                <input type="text" value={form.bankName} onChange={update('bankName')}
                  className="input-neon rounded-xl px-3.5 py-2.5 text-xs" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">UPI ID <span className="text-gray-700">(optional)</span></label>
              <input type="text" value={form.upiId} onChange={update('upiId')}
                className="input-neon rounded-xl px-3.5 py-2.5 text-xs" />
            </div>
            <button type="submit" disabled={submitting}
              className="btn-neon w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
              <Save size={14} /> {submitting ? 'Saving...' : 'Save Account'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
