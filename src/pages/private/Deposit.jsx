import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiggyBank, Clock, CheckCircle2, XCircle, Copy, Check, QrCode, Hash, ArrowLeft, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { FormSkeleton } from '../../components/ui/Skeleton';
import QRCode from 'qrcode';

export default function Deposit() {
  const [step, setStep] = useState('amount');
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [payment, setPayment] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/payment-info').then(({ data }) => data.success && setPayment(data.data)).catch(() => {}),
      api.get('/deposit').then(({ data }) => data.success && setDeposits(data.data)).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (payment?.upi_id) {
      const upiLink = `upi://pay?pa=${encodeURIComponent(payment.upi_id)}&pn=Paisa%20Hi%20Paisa&cu=INR`;
      QRCode.toDataURL(upiLink, {
        width: 300,
        margin: 1,
        color: { dark: '#00ff88', light: '#0a0a0a' }
      }).then(setQrDataUrl).catch(() => {});
    }
  }, [payment]);

  const handleProceed = () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 100) return toast.error('Minimum deposit is ₹100');
    setStep('payment');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!utr?.trim()) return toast.error('Enter UTR number');
    setSubmitting(true);
    try {
      const { data } = await api.post('/deposit', { amount: amt, utr: utr.trim() });
      if (data.success) {
        toast.success('Deposit request submitted!');
        setAmount(''); setUtr(''); setStep('amount');
        const res = await api.get('/deposit');
        if (res.data.success) setDeposits(res.data.data);
      } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const copyUpi = () => {
    if (payment?.upi_id) {
      navigator.clipboard.writeText(payment.upi_id);
      setCopied(true);
      toast.success('UPI ID copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusBadge = (s) => {
    if (s === 'approved') return <span className="flex items-center gap-1 text-[10px] text-green-400"><CheckCircle2 size={10} />Approved</span>;
    if (s === 'rejected') return <span className="flex items-center gap-1 text-[10px] text-red-400"><XCircle size={10} />Rejected</span>;
    return <span className="flex items-center gap-1 text-[10px] text-yellow-400"><Clock size={10} />Under Review</span>;
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="p-2 md:p-3 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <PiggyBank size={18} className="text-neon-green" />
        <h1 className="text-base md:text-lg font-bold">Deposit</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Left - Steps */}
        <div className="space-y-2">
          {/* Step 1: Enter Amount */}
          <AnimatePresence mode="wait">
            {step === 'amount' ? (
              <motion.div key="amount-step" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="glass-card rounded-xl p-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-neon-green/10 flex items-center justify-center mx-auto mb-3">
                  <IndianRupee size={28} className="text-neon-green" />
                </div>
                <p className="text-white text-sm font-bold mb-1">Enter Amount</p>
                <p className="text-gray-500 text-xs mb-4">How much would you like to deposit?</p>
                <div className="flex gap-2 mb-3">
                  {[500, 1000, 2000, 5000].map(a => (
                    <button key={a} onClick={() => setAmount(a)}
                      className={`btn-dark flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${parseFloat(amount) === a ? 'border-neon-green/30 bg-neon-green/5 text-neon-green' : ''}`}>
                      {'\u20B9'}{a}
                    </button>
                  ))}
                </div>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="Enter custom amount" min="100"
                  className="input-neon rounded-lg px-3 py-2.5 text-sm text-center mb-3" />
                <button onClick={handleProceed} disabled={!parseFloat(amount) || parseFloat(amount) < 100}
                  className="btn-neon w-full py-3 rounded-xl text-sm font-bold">
                  Add Amount {'\u20B9'}{parseFloat(amount) > 0 ? parseFloat(amount).toLocaleString('en-IN') : ''}
                </button>
              </motion.div>
            ) : (
              <motion.div key="payment-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-2">
                {/* Back button */}
                <button onClick={() => setStep('amount')} className="btn-dark inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]">
                  <ArrowLeft size={13} /> Change Amount
                </button>

                {/* QR + UPI */}
                {payment && (
                  <div className="glass-card rounded-xl p-4 text-center">
                    <div className="flex items-center gap-2 mb-3 justify-center">
                      <QrCode size={16} className="text-neon-green" />
                      <span className="text-white text-xs font-bold uppercase tracking-wider">Scan & Pay</span>
                    </div>
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="UPI QR Code" className="mx-auto rounded-xl" style={{ width: 170, height: 170 }} />
                    ) : (
                      <div className="w-[170px] h-[170px] mx-auto skeleton rounded-xl" />
                    )}
                    <div className="flex items-center gap-2 mt-3 justify-center">
                      <code className="font-orbitron text-neon-green text-xs bg-neon-green/5 rounded-lg px-3 py-1.5 border border-neon-green/10">
                        {payment.upi_id}
                      </code>
                      <button onClick={copyUpi} className="btn-dark p-1.5 rounded-lg">
                        {copied ? <Check size={13} className="text-neon-green" /> : <Copy size={13} />}
                      </button>
                    </div>
                    <p className="text-gray-600 text-[10px] mt-2">Amount: {'\u20B9'}{parseFloat(amount).toLocaleString('en-IN')}</p>
                  </div>
                )}

                {/* UTR Form */}
                <form onSubmit={handleSubmit} className="glass-card rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1.5">
                      UTR Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="text" value={utr} onChange={e => setUtr(e.target.value)}
                        placeholder="Enter UTR number from transaction"
                        className="input-neon rounded-lg px-3 py-2.5 text-sm pl-9" />
                    </div>
                    <p className="text-gray-600 text-[10px] mt-1">UTR is on your bank statement or SMS after payment</p>
                  </div>
                  <button type="submit" disabled={submitting || !utr?.trim()}
                    className="btn-neon w-full py-2.5 rounded-lg text-sm font-bold">
                    {submitting ? 'Submitting...' : 'Submit Deposit'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right - History */}
        <div className="glass-card rounded-xl p-3">
          <h3 className="text-white text-xs font-bold mb-2 flex items-center gap-1.5">
            <Clock size={13} className="text-neon-green" /> History
          </h3>
          {deposits.length === 0 ? (
            <p className="text-gray-600 text-xs text-center py-6">No deposits yet</p>
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto custom-scroll">
              {deposits.map((d, i) => (
                <motion.div key={d.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="glass rounded-lg p-2.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium">{'\u20B9'}{parseFloat(d.amount).toLocaleString('en-IN')}</p>
                    <p className="text-gray-600 text-[10px] truncate">{d.utr ? `UTR: ${d.utr}` : ''}</p>
                    <p className="text-gray-600 text-[10px]">{new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {statusBadge(d.status)}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
