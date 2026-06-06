import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Copy, Check, Calendar, Key, Save, Edit3, LogOut, Star, Gift, X, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/ui/Skeleton';

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // popups
  const [showEdit, setShowEdit] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // edit form
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '' });
  const [saving, setSaving] = useState(false);

  // change password form
  const [cp, setCp] = useState({ current: '', newP: '', confirm: '' });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.full_name || '', email: user.email || '', mobile: user.mobile || '' });
      setBalance(user.balance || 0);
    }
    api.get('/user/balance').then(({ data }) => data.success && setBalance(data.data.balance)).catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/user/profile', form);
      if (data.success) {
        toast.success('Profile updated!');
        await refreshUser();
        setShowEdit(false);
      } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (cp.newP !== cp.confirm) return toast.error('Passwords do not match');
    if (cp.newP.length < 6) return toast.error('Password must be 6+ chars');
    setChangingPw(true);
    try {
      const { data } = await api.post('/auth/change-password', { currentPassword: cp.current, newPassword: cp.newP });
      if (data.success) {
        toast.success('Password changed!');
        setCp({ current: '', newP: '', confirm: '' });
        setShowPw(false);
      } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setChangingPw(false); }
  };

  const copyCode = () => {
    const code = user?.referral_code || 'N/A';
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  if (loading) return (
    <div className="p-3 space-y-3 max-w-lg mx-auto">
      <Skeleton className="w-full h-48 rounded-xl" />
      <Skeleton className="w-full h-32 rounded-xl" />
    </div>
  );

  return (
    <div className="p-3 space-y-3 max-w-lg mx-auto">
      {/* ===== PROFILE CARD ===== */}
      <div className="glass-card rounded-2xl p-5 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-neon-green/5 to-transparent" />
        <div className="relative flex flex-col items-center text-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-green/5 flex items-center justify-center mb-3 border border-neon-green/10">
            <span className="font-orbitron text-neon-green text-xl font-bold">{initials}</span>
          </div>
          <h2 className="text-white text-base font-bold">{user?.full_name || 'User'}</h2>
          <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
            <Mail size={10} />
            {user?.email}
          </p>
          <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
            <Phone size={10} />
            {user?.mobile || 'N/A'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between glass rounded-xl px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-neon-green" />
              <span className="text-gray-400 text-xs">Balance</span>
            </div>
            <span className="font-orbitron text-neon-green text-sm font-bold">₹{parseFloat(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between glass rounded-xl px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <Gift size={14} className="text-yellow-500" />
              <span className="text-gray-400 text-xs">Referral Code</span>
            </div>
            <div className="flex items-center gap-1.5">
              <code className="font-orbitron text-yellow-400 text-xs">{user?.referral_code || 'N/A'}</code>
              <button onClick={copyCode} className="text-gray-500 hover:text-white transition-colors">
                {copied ? <Check size={13} className="text-neon-green" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between glass rounded-xl px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-blue-400" />
              <span className="text-gray-400 text-xs">Joined</span>
            </div>
            <span className="text-gray-400 text-xs">{joined}</span>
          </div>
        </div>
      </div>

      {/* ===== ACTION BUTTONS ===== */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-white text-[10px] font-bold uppercase tracking-wider mb-3 text-gray-500">Account Settings</h3>
        <div className="space-y-1.5">
          <button onClick={() => { setShowEdit(true); }} className="w-full flex items-center gap-3 glass rounded-xl px-3.5 py-2.5 hover:bg-white/5 transition-all">
            <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center">
              <Edit3 size={14} className="text-neon-green" />
            </div>
            <div className="text-left flex-1">
              <p className="text-white text-xs font-medium">Edit Profile</p>
              <p className="text-gray-600 text-[10px]">Name, email, mobile</p>
            </div>
            <span className="text-gray-600 text-xs">›</span>
          </button>

          <button onClick={() => { setShowPw(true); }} className="w-full flex items-center gap-3 glass rounded-xl px-3.5 py-2.5 hover:bg-white/5 transition-all">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Key size={14} className="text-yellow-400" />
            </div>
            <div className="text-left flex-1">
              <p className="text-white text-xs font-medium">Change Password</p>
              <p className="text-gray-600 text-[10px]">Update your password</p>
            </div>
            <span className="text-gray-600 text-xs">›</span>
          </button>

          <button onClick={logout} className="w-full flex items-center gap-3 glass rounded-xl px-3.5 py-2.5 hover:bg-red-500/5 transition-all">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <LogOut size={14} className="text-red-400" />
            </div>
            <div className="text-left flex-1">
              <p className="text-red-400 text-xs font-medium">Logout</p>
              <p className="text-gray-600 text-[10px]">Sign out of your account</p>
            </div>
            <span className="text-gray-600 text-xs">›</span>
          </button>
        </div>
      </div>

      {/* ===== EDIT PROFILE POPUP ===== */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowEdit(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="glass-card rounded-2xl p-5 w-full max-w-sm mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-sm font-bold flex items-center gap-2">
                  <Edit3 size={16} className="text-neon-green" />
                  Edit Profile
                </h3>
                <button onClick={() => setShowEdit(false)} className="text-gray-500 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                  <input type="text" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                    className="input-neon rounded-xl px-3.5 py-2.5 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Email</label>
                  <input type="email" value={form.email} readOnly
                    className="input-neon rounded-xl px-3.5 py-2.5 text-xs opacity-60 cursor-default" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Mobile</label>
                  <input type="text" value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))}
                    className="input-neon rounded-xl px-3.5 py-2.5 text-xs" maxLength={10} />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowEdit(false)}
                    className="btn-dark flex-1 py-2.5 rounded-xl text-xs font-medium">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="btn-neon flex-1 py-2.5 rounded-xl text-xs font-bold">
                    {saving ? 'Saving...' : <><Save size={14} className="inline mr-1" />Save</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== CHANGE PASSWORD POPUP ===== */}
      <AnimatePresence>
        {showPw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowPw(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="glass-card rounded-2xl p-5 w-full max-w-sm mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-sm font-bold flex items-center gap-2">
                  <Key size={16} className="text-yellow-400" />
                  Change Password
                </h3>
                <button onClick={() => setShowPw(false)} className="text-gray-500 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleChangePw} className="space-y-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Current Password</label>
                  <input type="password" value={cp.current} onChange={e => setCp(p => ({ ...p, current: e.target.value }))}
                    className="input-neon rounded-xl px-3.5 py-2.5 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">New Password</label>
                  <input type="password" value={cp.newP} onChange={e => setCp(p => ({ ...p, newP: e.target.value }))}
                    className="input-neon rounded-xl px-3.5 py-2.5 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Confirm New Password</label>
                  <input type="password" value={cp.confirm} onChange={e => setCp(p => ({ ...p, confirm: e.target.value }))}
                    className="input-neon rounded-xl px-3.5 py-2.5 text-xs" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowPw(false)}
                    className="btn-dark flex-1 py-2.5 rounded-xl text-xs font-medium">Cancel</button>
                  <button type="submit" disabled={changingPw}
                    className="btn-neon flex-1 py-2.5 rounded-xl text-xs font-bold">
                    {changingPw ? 'Changing...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
