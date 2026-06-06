import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Flame } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error('Fill all fields');
    setLoading(true);
    try {
      await adminLogin({ username, password });
      toast.success('Welcome Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-neon-green/[0.03] blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm">
        <div className="glass-card rounded-2xl p-6 neon-border">
          <div className="text-center mb-5">
            <Shield size={28} className="text-neon-green mx-auto mb-2" />
            <h1 className="font-orbitron text-neon-green text-lg font-bold neon-text">Admin</h1>
            <p className="text-gray-500 text-xs mt-1">Paisa Hi Paisa Administration</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Username" className="input-neon rounded-xl px-4 py-3 text-sm" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" className="input-neon rounded-xl px-4 py-3 text-sm" />
            <button type="submit" disabled={loading}
              className="btn-neon w-full py-3 rounded-xl text-sm font-bold">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
