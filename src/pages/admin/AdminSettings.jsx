import { useState, useEffect } from 'react';
import { Settings, Smartphone, Gift, Gamepad2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function AdminSettings() {
  const [payment, setPayment] = useState({ upiId: '', qrCode: '' });
  const [bonus, setBonus] = useState(50);
  const [speed, setSpeed] = useState(0.015);
  const [loading, setLoading] = useState({ payment: false, bonus: false, game: false });

  useEffect(() => {
    api.get('/admin/payment-settings').then(({ data }) => {
      if (data.success && data.data) {
        setPayment({ upiId: data.data.upi_id || '', qrCode: data.data.qr_code || '' });
      }
    }).catch(() => {});
  }, []);

  const savePayment = async (e) => {
    e.preventDefault();
    setLoading(p => ({ ...p, payment: true }));
    try {
      const { data } = await api.put('/admin/payment-settings', payment);
      if (data.success) toast.success('Payment settings saved!');
      else toast.error(data.message);
    } catch { toast.error('Failed'); }
    finally { setLoading(p => ({ ...p, payment: false })); }
  };

  const saveBonus = async (e) => {
    e.preventDefault();
    setLoading(p => ({ ...p, bonus: true }));
    try {
      const { data } = await api.put('/admin/referral-bonus', { bonus: parseFloat(bonus) });
      if (data.success) toast.success('Referral bonus updated!');
      else toast.error(data.message);
    } catch { toast.error('Failed'); }
    finally { setLoading(p => ({ ...p, bonus: false })); }
  };

  const saveGame = async (e) => {
    e.preventDefault();
    setLoading(p => ({ ...p, game: true }));
    try {
      const { data } = await api.put('/admin/game-settings', { speed: parseFloat(speed) });
      if (data.success) toast.success('Game settings updated!');
      else toast.error(data.message);
    } catch { toast.error('Failed'); }
    finally { setLoading(p => ({ ...p, game: false })); }
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Settings size={18} className="text-neon-green" />
        <h1 className="text-lg font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Payment */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone size={16} className="text-neon-green" />
            <h3 className="text-white text-xs font-bold uppercase tracking-wider">Payment</h3>
          </div>
          <form onSubmit={savePayment} className="space-y-2">
            <input type="text" value={payment.upiId} onChange={e => setPayment(p => ({ ...p, upiId: e.target.value }))}
              placeholder="UPI ID" className="input-neon rounded-lg px-3 py-2.5 text-xs" />
            <input type="text" value={payment.qrCode} onChange={e => setPayment(p => ({ ...p, qrCode: e.target.value }))}
              placeholder="QR Code URL (optional)" className="input-neon rounded-lg px-3 py-2.5 text-xs" />
            <button type="submit" disabled={loading.payment}
              className="btn-neon w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
              <Save size={13} /> {loading.payment ? 'Saving...' : 'Save Payment'}
            </button>
          </form>
        </div>

        {/* Referral */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gift size={16} className="text-neon-green" />
            <h3 className="text-white text-xs font-bold uppercase tracking-wider">Referral Bonus</h3>
          </div>
          <form onSubmit={saveBonus} className="space-y-2">
            <input type="number" value={bonus} onChange={e => setBonus(e.target.value)}
              placeholder="Bonus amount (₹)" className="input-neon rounded-lg px-3 py-2.5 text-xs" />
            <button type="submit" disabled={loading.bonus}
              className="btn-neon w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
              <Save size={13} /> {loading.bonus ? 'Saving...' : 'Save Bonus'}
            </button>
          </form>
        </div>

        {/* Game */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gamepad2 size={16} className="text-neon-green" />
            <h3 className="text-white text-xs font-bold uppercase tracking-wider">Game Speed</h3>
          </div>
          <form onSubmit={saveGame} className="space-y-2">
            <input type="number" value={speed} onChange={e => setSpeed(e.target.value)} step="0.001"
              placeholder="Speed (0.01-0.05)" className="input-neon rounded-lg px-3 py-2.5 text-xs" />
            <p className="text-gray-600 text-[10px]">Higher = faster multiplier increase</p>
            <button type="submit" disabled={loading.game}
              className="btn-neon w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
              <Save size={13} /> {loading.game ? 'Saving...' : 'Save Speed'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
