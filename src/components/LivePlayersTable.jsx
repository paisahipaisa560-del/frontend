import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAKE_USERS = [
  { name: '1***4', color: '#39FF14' },
  { name: '1***f', color: '#FF6B6B' },
  { name: '1***5', color: '#6BCBFF' },
  { name: '2***k', color: '#FFD93D' },
  { name: '8***p', color: '#FF8E53' },
  { name: '7***m', color: '#A66CFF' },
  { name: '3***r', color: '#FF6B6B' },
  { name: '9***x', color: '#39FF14' },
  { name: '4***z', color: '#FFD93D' },
  { name: '0***t', color: '#6BCBFF' },
  { name: '5***h', color: '#FF8E53' },
  { name: '6***v', color: '#A66CFF' },
  { name: 'k***7', color: '#FF4444' },
  { name: 'x***2', color: '#FFD700' },
  { name: 'j***9', color: '#39FF14' },
  { name: 'p***3', color: '#FF6B6B' },
  { name: 'm***8', color: '#6BCBFF' },
  { name: 'n***1', color: '#A66CFF' },
  { name: 'r***6', color: '#FFD93D' },
  { name: 't***0', color: '#FF8E53' },
  { name: 'v***4', color: '#FF4444' },
  { name: 'w***5', color: '#39FF14' },
  { name: 's***3', color: '#FFD700' },
  { name: 'l***2', color: '#6BCBFF' },
  { name: 'h***7', color: '#FF6B6B' },
  { name: 'b***9', color: '#A66CFF' },
  { name: 'g***0', color: '#FF8E53' },
  { name: 'd***5', color: '#39FF14' },
  { name: 'f***1', color: '#FFD700' },
  { name: 'c***6', color: '#FF4444' },
];

function rand(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generatePlayer() {
  const user = pick(FAKE_USERS);
  const betAmount = randInt(100, 50000);
  const isWin = Math.random() > 0.45;
  const multiplier = isWin ? parseFloat(rand(1.01, 15).toFixed(2)) : parseFloat(rand(1.01, 3).toFixed(2));
  const winAmount = isWin ? Math.round(betAmount * multiplier) : 0;
  const result = isWin ? 'win' : 'loss';
  const isHighMultiplier = isWin && multiplier >= 5;

  return {
    id: Date.now() + Math.random(),
    user,
    betAmount,
    multiplier,
    winAmount,
    result,
    isHighMultiplier,
    timestamp: Date.now(),
  };
}

function CountUp({ value, prefix = '', suffix = '', duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const startVal = prevRef.current;
    const endVal = value;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;
      setDisplay(current);
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    prevRef.current = endVal;
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value, duration]);

  return <>{prefix}{display.toLocaleString('en-IN', { maximumFractionDigits: 2 })}{suffix}</>;
}

export default function LivePlayersTable({ visible = 8 }) {
  const [players, setPlayers] = useState(() =>
    Array.from({ length: visible }, () => generatePlayer())
  );
  const [totalBets, setTotalBets] = useState(randInt(500, 2000));
  const [totalWin, setTotalWin] = useState(randInt(500000, 5000000));
  const containerRef = useRef(null);

  const addPlayer = useCallback(() => {
    const newPlayer = generatePlayer();
    setPlayers(prev => {
      const next = [newPlayer, ...prev.slice(0, 19)];
      return next;
    });
    setTotalBets(prev => prev + 1);
    if (newPlayer.result === 'win') {
      setTotalWin(prev => prev + newPlayer.winAmount);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const batchSize = randInt(1, 3);
      for (let i = 0; i < batchSize; i++) setTimeout(addPlayer, i * 200);
    }, randInt(1800, 4000));
    return () => clearInterval(interval);
  }, [addPlayer]);

  const getRowStyle = (player) => {
    if (player.isHighMultiplier) {
      return 'border-l-2 border-neon-green/60 bg-gradient-to-r from-neon-green/10 to-transparent shadow-[0_0_15px_rgba(57,255,20,0.08)]';
    }
    if (player.result === 'win') {
      return 'border-l-2 border-green-400/40 bg-gradient-to-r from-green-500/5 to-transparent';
    }
    return 'border-l-2 border-transparent bg-white/[0.02]';
  };

  return (
    <div className="glass-card rounded-2xl p-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          <span className="text-white text-xs font-bold uppercase tracking-wider neon-text">Live Players</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            key={totalBets}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[10px] font-orbitron text-gray-400"
          >
            <span className="text-neon-green font-bold">{totalBets.toLocaleString('en-IN')}</span>
            <span className="text-gray-600"> Bets</span>
          </motion.div>
          <div className="w-px h-3 bg-white/10" />
          <motion.div
            key={totalWin}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[10px] font-orbitron text-gray-400"
          >
            <span className="text-neon-green font-bold">₹{totalWin.toLocaleString('en-IN')}</span>
            <span className="text-gray-600"> Won</span>
          </motion.div>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-1 pb-1.5 text-[9px] text-gray-600 font-bold uppercase tracking-wider font-orbitron">
        <div className="flex-[2]">Player</div>
        <div className="flex-1 text-right">Bet</div>
        <div className="flex-1 text-right">X</div>
        <div className="flex-1 text-right">Win</div>
      </div>

      {/* Table body */}
      <div ref={containerRef} className="space-y-1 max-h-[420px] overflow-y-auto custom-scroll pr-0.5">
        <AnimatePresence mode="popLayout">
          {players.slice(0, visible).map((player) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
              className={`flex items-center px-2.5 py-2 rounded-xl ${getRowStyle(player)} hover:bg-white/[0.04] transition-colors cursor-default`}
            >
              {/* Player column */}
              <div className="flex-[2] flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${player.user.color}33, ${player.user.color}15)`,
                    border: `1px solid ${player.user.color}40`,
                    boxShadow: `0 0 8px ${player.user.color}20`,
                  }}
                >
                  <img src={`https://api.dicebear.com/7.x/identicon/png?seed=${player.user.name}&size=28`} alt="" className="w-full h-full rounded-full" />
                </div>
                <span className="text-white text-xs font-medium truncate tracking-wide">{player.user.name}</span>
              </div>

              {/* Bet column */}
              <div className="flex-1 text-right">
                <span className="text-gray-300 text-[11px] font-orbitron font-medium">
                  ₹{player.betAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Multiplier column */}
              <div className="flex-1 text-right">
                {player.result === 'win' ? (
                  <span className={`text-[11px] font-orbitron font-bold ${
                    player.isHighMultiplier
                      ? 'text-neon-green drop-shadow-[0_0_6px_rgba(57,255,20,0.3)]'
                      : 'text-neon-green'
                  }`}>
                    {player.multiplier.toFixed(2)}x
                  </span>
                ) : (
                  <span className="text-gray-600 text-[11px] font-orbitron">---</span>
                )}
              </div>

              {/* Win column */}
              <div className="flex-1 text-right">
                {player.result === 'win' ? (
                  <motion.span
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className={`text-[11px] font-orbitron font-bold ${
                      player.isHighMultiplier
                        ? 'text-neon-green drop-shadow-[0_0_8px_rgba(57,255,20,0.3)]'
                        : 'text-neon-green'
                    }`}
                  >
                    ₹{player.winAmount.toLocaleString('en-IN')}
                  </motion.span>
                ) : (
                  <span className="text-gray-600 text-[11px] font-orbitron">---</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1 text-[10px] text-gray-600">
          <span className="text-neon-green/60">✔</span>
          <span className="font-orbitron tracking-wider">Provably Fair Game</span>
        </div>
        <div className="text-[10px] text-gray-700 font-orbitron tracking-wider">
          Powered by <span className="text-neon-green/50">Paisa Hi Paisa</span>
        </div>
      </div>
    </div>
  );
}
