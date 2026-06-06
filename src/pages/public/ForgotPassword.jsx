import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Mail, Key, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Enter your email');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.success) {
        toast.success(`OTP sent: ${data.data.otp}`);
        setStep(2);
      } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return toast.error('Fill all fields');
    if (newPassword.length < 6) return toast.error('Password must be 6+ chars');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, newPassword });
      if (data.success) {
        toast.success('Password reset!');
        navigate('/login');
      } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
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
            <h1 className="font-orbitron text-neon-green text-lg font-bold neon-text">Reset</h1>
            <p className="text-gray-500 text-xs mt-1">{step === 1 ? 'Enter email to get OTP' : 'Enter OTP and new password'}</p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Your email" className="input-neon rounded-xl px-10 py-3 text-sm w-full" />
              </div>
              <button type="submit" disabled={loading}
                className="btn-neon w-full py-3 rounded-xl text-sm font-bold">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-3">
              <div className="relative">
                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                  placeholder="Enter OTP" className="input-neon rounded-xl px-10 py-3 text-sm w-full" maxLength={6} />
              </div>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="New password" className="input-neon rounded-xl px-4 py-3 text-sm w-full" />
              <button type="submit" disabled={loading}
                className="btn-neon w-full py-3 rounded-xl text-sm font-bold">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-500 mt-4">
            <Link to="/login" className="text-neon-green hover:underline">Back to login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
