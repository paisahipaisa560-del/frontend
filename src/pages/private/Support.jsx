import { useState, useEffect } from 'react';
import { Headphones, MessageCircle, Send, ExternalLink, MessageSquare } from 'lucide-react';
import api from '../../lib/api';

export default function Support() {
  const [support, setSupport] = useState({ telegram: '', whatsapp: '' });

  useEffect(() => {
    api.get('/support').then(({ data }) => {
      if (data.success && data.data) {
        setSupport(data.data);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="p-2 md:p-3 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Headphones size={18} className="text-neon-green" />
        <h1 className="text-base md:text-lg font-bold">Support</h1>
      </div>

      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-neon-green/10 flex items-center justify-center mx-auto mb-4">
          <Headphones size={32} className="text-neon-green" />
        </div>
        <p className="text-white text-sm font-bold mb-1">Need Help?</p>
        <p className="text-gray-500 text-xs mb-6">Reach out to our support team</p>

        <div className="space-y-3 max-w-md mx-auto">
          {support.telegram ? (
            <a
              href={support.telegram.startsWith('http') ? support.telegram : `https://t.me/${support.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-dark w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all group"
            >
              <Send size={18} className="text-blue-400 group-hover:text-blue-300" />
              <span>Telegram Support</span>
              <ExternalLink size={14} className="text-gray-600" />
            </a>
          ) : (
            <div className="btn-dark w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 opacity-40 cursor-not-allowed">
              <Send size={18} className="text-gray-600" />
              <span className="text-gray-600">Telegram — Coming Soon</span>
            </div>
          )}

          {support.whatsapp ? (
            <a
              href={`https://wa.me/${support.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-dark w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 hover:bg-green-500/10 hover:border-green-500/20 transition-all group"
            >
              <MessageCircle size={18} className="text-green-400 group-hover:text-green-300" />
              <span>WhatsApp Support</span>
              <ExternalLink size={14} className="text-gray-600" />
            </a>
          ) : (
            <div className="btn-dark w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 opacity-40 cursor-not-allowed">
              <MessageCircle size={18} className="text-gray-600" />
              <span className="text-gray-600">WhatsApp — Coming Soon</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
