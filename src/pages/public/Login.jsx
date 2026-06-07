import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Flame, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return toast.error('Fill all fields');
    setLoading(true);
    try {
      await login({ email: identifier, password });
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-neon-green/10 flex items-center justify-center mx-auto mb-3 border border-neon-green/20">
              <Flame size={28} className="text-neon-green drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]" />
            </div>
            <h1 className="font-orbitron text-neon-green text-xl font-bold neon-text tracking-wider">Paisa Hi Paisa</h1>
            <p className="text-gray-600 text-xs mt-1.5">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)}
              placeholder="Email or Mobile" className="input-neon rounded-xl px-4 py-3 text-sm" />
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" className="input-neon rounded-xl px-4 py-3 text-sm pr-10" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="btn-neon w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
              {loading ? 'Signing in...' : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <div className="flex items-center justify-between mt-4 text-xs">
            <Link to="/register" className="text-neon-green hover:underline">Create account</Link>
            <Link to="/forgot-password" className="text-gray-500 hover:text-white">Forgot password?</Link>
          </div>

          <div className="mt-5 pt-4 border-t border-white/5 text-center">
            <p className="text-gray-700 text-[10px] tracking-wider uppercase">Play Smart. Win Big. Fly High.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
