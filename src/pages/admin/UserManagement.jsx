import { useState, useEffect } from 'react';
import { Search, Ban, Check, X, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [balanceModal, setBalanceModal] = useState(null);
  const [balForm, setBalForm] = useState({ amount: '', type: 'add' });
  const limit = 15;

  const fetchUsers = () => {
    api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`)
      .then(({ data }) => data.success && (setUsers(data.data), setTotal(data.total)))
      .catch(() => {});
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const toggleBan = (id, name) => {
    if (!window.confirm(`Ban/unban ${name}?`)) return;
    api.put(`/admin/users/${id}/ban`).then(({ data }) => {
      if (data.success) { toast.success(data.message); fetchUsers(); }
      else toast.error(data.message);
    }).catch(() => toast.error('Failed'));
  };

  const handleBalance = async (e) => {
    e.preventDefault();
    if (!balForm.amount || balForm.amount <= 0) return toast.error('Enter valid amount');
    try {
      const { data } = await api.put(`/admin/users/${balanceModal.id}/balance`, balForm);
      if (data.success) { toast.success('Balance updated!'); setBalanceModal(null); fetchUsers(); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Ban size={18} className="text-neon-green" />
        <h1 className="text-lg font-bold">User Management</h1>
      </div>

      {/* Search */}
      <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search by name, email or mobile..." className="input-neon rounded-xl px-4 py-2.5 text-sm" />

      {/* Users table */}
      <div className="glass-card rounded-xl p-3">
        <div className="table-wrap">
          <table className="table-neon">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Mobile</th><th>Balance</th><th>Referrals</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="text-white text-xs font-medium">{u.full_name}</td>
                  <td className="text-gray-400 text-xs">{u.email}</td>
                  <td className="text-gray-400 text-xs">{u.mobile}</td>
                  <td className="text-neon-green text-xs font-orbitron">₹{parseFloat(u.balance).toLocaleString('en-IN')}</td>
                  <td className="text-gray-400 text-xs">{u.total_referrals}</td>
                  <td>{u.is_banned ? <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Banned</span> : <span className="text-[10px] text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-full">Active</span>}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => toggleBan(u.id, u.full_name)}
                        className="btn-dark p-1.5 rounded-lg" title={u.is_banned ? 'Unban' : 'Ban'}>
                        {u.is_banned ? <Check size={12} className="text-neon-green" /> : <Ban size={12} className="text-red-400" />}
                      </button>
                      <button onClick={() => setBalanceModal(u)}
                        className="btn-dark p-1.5 rounded-lg" title="Edit Balance">
                        <DollarSign size={12} className="text-yellow-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

      {/* Balance Modal */}
      {balanceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setBalanceModal(null)}>
          <div className="glass-card rounded-2xl p-5 w-full max-w-sm neon-border" onClick={e => e.stopPropagation()}>
            <h3 className="text-white text-sm font-bold mb-1">Edit Balance</h3>
            <p className="text-gray-500 text-xs mb-3">{balanceModal.full_name} — ₹{parseFloat(balanceModal.balance).toLocaleString('en-IN')}</p>
            <form onSubmit={handleBalance} className="space-y-2.5">
              <input type="number" value={balForm.amount} onChange={e => setBalForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="Amount" className="input-neon rounded-xl px-4 py-2.5 text-sm" />
              <div className="flex gap-2">
                {['add', 'subtract', 'set'].map(t => (
                  <button key={t} type="button" onClick={() => setBalForm(p => ({ ...p, type: t }))}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-medium uppercase ${
                      balForm.type === t ? 'btn-neon' : 'btn-dark'
                    }`}>{t}</button>
                ))}
              </div>
              <button type="submit" className="btn-neon w-full py-2.5 rounded-xl text-xs font-bold">Update</button>
            </form>
            <button onClick={() => setBalanceModal(null)} className="btn-dark w-full py-2 rounded-xl text-xs mt-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
