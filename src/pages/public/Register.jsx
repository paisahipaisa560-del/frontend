import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '', referralCode: '' });

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setForm(p => ({ ...p, referralCode: ref }));
  }, []);
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm">
        <div className="glass-card rounded-2xl p-6 neon-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <img src="/login bg.png" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
          <div className="text-center mb-6">
            <img src="/brand-logo.png" alt="Paisa Hi Paisa" className="h-12 mx-auto mb-3" />
            <p className="text-gray-600 text-xs mt-1.5">Create your account to start playing</p>
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

          <div className="mt-5 pt-4 border-t border-white/5 text-center">
            <p className="text-gray-700 text-[10px] tracking-wider uppercase">Play Smart. Win Big. Fly High.</p>
          </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
