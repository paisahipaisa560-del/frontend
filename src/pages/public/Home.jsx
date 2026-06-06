import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';
import { FaCheckCircle, FaCopy, FaGift, FaTag, FaCoins } from 'react-icons/fa';

const REFERRAL_CODE = 'PHP8160F6B6';

export default function Home() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const copyCode = () => {
    navigator.clipboard.writeText(REFERRAL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* TOP BAR — Login / Register */}
      <div className="bg-black px-4 py-3 border-b border-neon-green/5">
        <div className="max-w-sm mx-auto flex gap-3">
          <Link
            to="/login"
            className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-bold text-center active:scale-[0.97] transition-transform shadow-lg shadow-yellow-500/10"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold text-center active:scale-[0.97] transition-transform shadow-lg shadow-green-500/10"
          >
            Register
          </Link>
        </div>
      </div>

      {/* HEADER */}
      <header className="bg-[#050505] border-b border-neon-green/5 px-4 py-3">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/brand-logo.png" alt="Paisa Hi Paisa" className="h-8 w-auto" loading="eager" />
            <span className="font-bold text-base text-white neon-text">Paisa Hi Paisa</span>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            {menuOpen ? <X size={22} className="text-gray-400" /> : <Menu size={22} className="text-gray-400" />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="bg-[#050505] border-b border-neon-green/5 px-4 py-2">
          <div className="max-w-sm mx-auto space-y-0.5">
            {['Home', 'Login', 'Register'].map((item) => (
              <Link
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 text-sm text-gray-400 hover:text-neon-green rounded-lg hover:bg-neon-green/5 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* PAGE TITLE */}
      <div className="max-w-sm mx-auto px-4 pt-6 pb-1">
        <h1 className="text-xl font-bold text-white">
          Paisa Hi Paisa <span className="text-neon-green">Login</span>
        </h1>
      </div>

      {/* MAIN BANNER */}
      <div className="max-w-sm mx-auto px-4 py-3">
        <div className="rounded-2xl overflow-hidden relative bg-gradient-to-br from-gray-900 to-black border border-neon-green/10">
          <img
            src="/home-banner.png"
            alt="Paisa Hi Paisa"
            className="w-full h-auto block"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* REGISTER BUTTON */}
      <div className="max-w-sm mx-auto px-4 py-1">
        <Link
          to="/register"
          className="block w-full py-3.5 rounded-full bg-gradient-to-r from-yellow-500 via-yellow-500 to-orange-500 text-white text-sm font-bold text-center shadow-lg shadow-yellow-500/20 active:scale-[0.97] transition-transform"
        >
          Register On Paisa Hi Paisa
        </Link>
      </div>

      {/* INFO TABLE */}
      <div className="max-w-sm mx-auto px-4 py-3">
        <div className="glass-card rounded-3xl divide-y divide-neon-green/5 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-2xl bg-neon-green/10 flex items-center justify-center shrink-0">
              <FaTag className="text-neon-green text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">App Name</p>
              <p className="text-sm font-semibold text-white">Paisa Hi Paisa</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-2xl bg-yellow-500/10 flex items-center justify-center shrink-0">
              <FaGift className="text-yellow-400 text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Invite Code</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neon-green tracking-wider">{REFERRAL_CODE}</span>
                <button onClick={copyCode} className="p-1.5 rounded-xl hover:bg-white/5 transition-colors">
                  {copied ? <FaCheckCircle className="text-neon-green text-sm" /> : <FaCopy className="text-gray-500 text-sm" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <FaCoins className="text-orange-400 text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Promotion Bonus</p>
              <p className="text-sm font-semibold text-orange-400">Up To ₹5000</p>
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="max-w-sm mx-auto px-4 py-2 pb-10">
        <p className="text-sm text-gray-500 leading-relaxed">
          Register on Paisa Hi Paisa and experience exciting Aviator gameplay. Play games, win rewards, and enjoy instant deposits and withdrawals. Invite your friends and earn referral bonuses while enjoying smooth gaming experience.
        </p>
      </div>
    </div>
  );
}
