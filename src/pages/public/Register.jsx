import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Flame, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '', referralCode: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, mobile, password, confirmPassword, referralCode } = form;
    if (!fullName || !email || !mobile || !password) return toast.error('Fill all required fields');
    if (password.length < 6) return toast.error('Password must be 6+ characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (!/^\d{10,15}$/.test(mobile)) return toast.error('Invalid mobile number');
    setLoading(true);
    try {
      await register({ fullName, email, mobile, password, confirmPassword, referralCode: referralCode || undefined });
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-neon-green/[0.03] blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-neon-green/[0.02] blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm">
        <div className="glass-card rounded-2xl p-6 neon-border">
          <div className="text-center mb-5">
            <Flame size={28} className="text-neon-green mx-auto mb-2" />
            <h1 className="font-orbitron text-neon-green text-lg font-bold neon-text">PHP</h1>
            <p className="text-gray-500 text-xs mt-1">Create your Paisa Hi Paisa account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <input type="text" value={form.fullName} onChange={update('fullName')}
              placeholder="Full Name *" className="input-neon rounded-xl px-4 py-3 text-sm" />
            <input type="email" value={form.email} onChange={update('email')}
              placeholder="Email *" className="input-neon rounded-xl px-4 py-3 text-sm" />
            <input type="text" value={form.mobile} onChange={update('mobile')}
              placeholder="Mobile Number *" className="input-neon rounded-xl px-4 py-3 text-sm" maxLength={10} />
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={form.password} onChange={update('password')}
                placeholder="Password *" className="input-neon rounded-xl px-4 py-3 text-sm pr-10" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input type="password" value={form.confirmPassword} onChange={update('confirmPassword')}
              placeholder="Confirm Password *" className="input-neon rounded-xl px-4 py-3 text-sm" />
            <input type="text" value={form.referralCode} onChange={update('referralCode')}
              placeholder="Referral Code (optional)" className="input-neon rounded-xl px-4 py-3 text-sm" />
            <button type="submit" disabled={loading}
              className="btn-neon w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
              {loading ? 'Creating...' : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-neon-green hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
