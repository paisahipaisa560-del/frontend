import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Users, Banknote, LogOut, Settings, ArrowLeftRight, Menu, X, Shield, Flame } from 'lucide-react';

const adminNav = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/deposits', label: 'Deposits', icon: Banknote },
  { path: '/admin/withdrawals', label: 'Withdrawals', icon: ArrowLeftRight },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const { adminLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex lg:flex-col w-[200px] sidebar-gradient fixed left-0 top-0 bottom-0 z-40">
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-neon/10">
          <Shield size={18} className="text-neon-green" />
          <div>
            <span className="font-orbitron text-neon-green text-xs font-bold tracking-wider">PHP</span>
            <span className="block text-[9px] text-gray-500 uppercase">Admin Panel</span>
          </div>
        </div>
        <div className="flex-1 py-3 px-2 space-y-0.5">
          {adminNav.map((item) => (
            <Link key={item.path} to={item.path}
              className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive(item.path) ? 'active text-neon-green font-medium' : 'text-gray-400 hover:text-gray-200'
              }`}>
              <item.icon size={16} className={isActive(item.path) ? 'text-neon-green' : ''} />
              {item.label}
            </Link>
          ))}
        </div>
        <div className="p-3 border-t border-neon/10">
          <button onClick={handleLogout} className="btn-dark w-full py-2.5 rounded-lg text-xs flex items-center justify-center gap-2">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-solid flex items-center justify-between h-14 px-4">
        <button onClick={() => setSidebarOpen(true)} className="btn-dark p-2 rounded-lg"><Menu size={18} /></button>
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-neon-green" />
          <span className="font-orbitron text-neon-green text-xs font-bold">PHP Admin</span>
        </div>
        <button onClick={handleLogout} className="btn-dark p-2 rounded-lg"><LogOut size={18} /></button>
      </header>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="absolute left-0 top-0 bottom-0 w-[240px] sidebar-gradient" onClick={e => e.stopPropagation()}>
              <div className="h-14 flex items-center justify-between px-4 border-b border-neon/10">
                <span className="font-orbitron text-neon-green text-sm font-bold">PHP Admin</span>
                <button onClick={() => setSidebarOpen(false)} className="btn-dark p-1.5 rounded-lg"><X size={16} /></button>
              </div>
              <div className="px-2 py-3 space-y-0.5">
                {adminNav.map((item) => (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                    className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
                      isActive(item.path) ? 'active text-neon-green font-medium' : 'text-gray-400'
                    }`}>
                    <item.icon size={18} className={isActive(item.path) ? 'text-neon-green' : ''} />
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-neon/10">
                <button onClick={handleLogout} className="btn-dark w-full py-3 rounded-lg text-sm">Logout</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav - mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bottom-nav">
        <div className="flex items-center justify-around h-16 px-1">
          {adminNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-[60px] ${
                isActive(item.path) ? 'text-neon-green' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <item.icon size={20} className={isActive(item.path) ? 'text-neon-green' : ''} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive(item.path) && <div className="w-4 h-0.5 rounded-full bg-neon-green mt-0.5" />}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 lg:ml-[200px] min-h-screen gradient-bg">
        <div className="lg:pt-0 pt-14 pb-16 lg:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}
