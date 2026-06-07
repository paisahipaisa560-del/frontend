import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, History, DollarSign, Clock, Volume2, VolumeX, Users, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { AviatorSkeleton } from '../../components/ui/Skeleton';

const MAX_MULTIPLIER = 50;
const FAKE_NAMES = [
  '1***4', '1***f', '1***5', '2***k', '8***p', '7***m',
  '3***r', '9***x', '4***z', '0***t', '5***h', '6***v',
  'k***7', 'x***2', 'j***9', 'p***3', 'm***8', 'n***1',
  'r***6', 't***0', 'v***4', 'w***5', 's***3', 'l***2',
  'h***7', 'b***9', 'g***0', 'd***5', 'f***1', 'c***6'
];

function rand(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  init() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    }
  }
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
  playTone(freq, dur, type = 'sine', vol = 0.1) {
    if (!this.enabled || !this.ctx) return;
    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, this.ctx.currentTime);
      g.gain.setValueAtTime(vol, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start();
      o.stop(this.ctx.currentTime + dur);
    } catch {}
  }
  betPlaced() { this.playTone(800, 0.08, 'square', 0.04); }
  cashOut() {
    this.playTone(523, 0.1);
    setTimeout(() => this.playTone(659, 0.1), 80);
    setTimeout(() => this.playTone(784, 0.15), 160);
  }
  crash() {
    this.playTone(70, 0.5, 'sawtooth', 0.12);
    setTimeout(() => this.playTone(50, 0.35, 'sawtooth', 0.08), 80);
  }
  engineHum(m) {
    const freq = 80 + m * 20;
    this.playTone(Math.min(freq, 300), 0.1, 'sine', 0.015);
  }
}

class ConfettiSystem {
  constructor(canvasRef) {
    this.canvasRef = canvasRef;
    this.particles = [];
    this.animId = null;
  }
  burst(count = 40) {
    const canvas = this.canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
    canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    const w = canvas.width;
    const colors = ['#39FF14', '#FFD700', '#FF4444', '#44AAFF', '#FF8800', '#FF44FF', '#44FF44', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: w * 0.1 + Math.random() * w * 0.8, y: -10,
        w: 3 + Math.random() * 5, h: 3 + Math.random() * 5,
        vx: (Math.random() - 0.5) * 8, vy: 2 + Math.random() * 6,
        color: pick(colors), rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 12, life: 1
      });
    }
    if (!this.animId) this.animate();
  }
  animate() {
    const canvas = this.canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.rot += p.rotV; p.life -= 0.01;
      if (p.life <= 0) return false;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      return p.y < h + 30;
    });
    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(() => this.animate());
    } else {
      this.animId = null;
      ctx.clearRect(0, 0, w, h);
    }
  }
  destroy() { if (this.animId) cancelAnimationFrame(this.animId); this.particles = []; }
}

function getColor(m) {
  if (m >= 10) return '#FFD700';
  if (m >= 5) return '#FF8C00';
  if (m >= 2) return '#7FFF00';
  return '#39FF14';
}

function drawPlane(ctx, x, y, angle, scale, thrust) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const s = scale || 1;
  const t = thrust || 1;

  const len = 28 * s;
  const wingSpan = 18 * s;
  const bodyW = 3.5 * s;

  // === ENGINE EXHAUST ===
  const flameLen = 14 * s * t;
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 25 * s;
  const grad = ctx.createLinearGradient(-flameLen * 0.7, 0, 0, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.3, 'rgba(255,220,50,0.7)');
  grad.addColorStop(0.6, 'rgba(255,120,0,0.4)');
  grad.addColorStop(1, 'rgba(255,50,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -bodyW * 0.3);
  ctx.quadraticCurveTo(-flameLen * 0.4, -bodyW * 0.5, -flameLen, 0);
  ctx.quadraticCurveTo(-flameLen * 0.4, bodyW * 0.5, 0, bodyW * 0.3);
  ctx.closePath();
  ctx.fill();

  // secondary flame
  ctx.shadowBlur = 12 * s;
  const grad2 = ctx.createLinearGradient(-flameLen * 0.5, 0, 0, 0);
  grad2.addColorStop(0, 'rgba(255,150,0,0.3)');
  grad2.addColorStop(1, 'rgba(255,50,0,0)');
  ctx.fillStyle = grad2;
  ctx.beginPath();
  ctx.moveTo(0, -bodyW * 0.6);
  ctx.quadraticCurveTo(-flameLen * 0.3, -bodyW * 0.7, -flameLen * 0.6, 0);
  ctx.quadraticCurveTo(-flameLen * 0.3, bodyW * 0.7, 0, bodyW * 0.6);
  ctx.closePath();
  ctx.fill();

  // spark particles
  ctx.shadowBlur = 0;
  for (let i = 0; i < 4; i++) {
    const sx = -2 * s - Math.random() * 6 * s;
    const sy = (Math.random() - 0.5) * 5 * s;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.8 * s * Math.random(), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,200,50,${0.3 + Math.random() * 0.5})`;
    ctx.fill();
  }

  // === FUSELAGE ===
  ctx.shadowColor = '#39FF14';
  ctx.shadowBlur = 8 * s;
  const bodyGrad = ctx.createLinearGradient(-len * 0.3, -bodyW, -len * 0.3, bodyW);
  bodyGrad.addColorStop(0, '#d0d0d0');
  bodyGrad.addColorStop(0.3, '#f0f0f0');
  bodyGrad.addColorStop(0.5, '#ffffff');
  bodyGrad.addColorStop(0.7, '#e0e0e0');
  bodyGrad.addColorStop(1, '#a0a0a0');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(len * 0.5, 0);
  ctx.quadraticCurveTo(len * 0.4, -bodyW * 0.7, len * 0.15, -bodyW);
  ctx.lineTo(-len * 0.25, -bodyW);
  ctx.quadraticCurveTo(-len * 0.35, -bodyW * 0.8, -len * 0.35, 0);
  ctx.quadraticCurveTo(-len * 0.35, bodyW * 0.8, -len * 0.25, bodyW);
  ctx.lineTo(len * 0.15, bodyW);
  ctx.quadraticCurveTo(len * 0.4, bodyW * 0.7, len * 0.5, 0);
  ctx.closePath();
  ctx.fill();

  // fuselage highlight stripe
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(len * 0.3, 0);
  ctx.lineTo(len * 0.1, -bodyW * 0.4);
  ctx.lineTo(-len * 0.15, -bodyW * 0.4);
  ctx.lineTo(-len * 0.15, bodyW * 0.4);
  ctx.lineTo(len * 0.1, bodyW * 0.4);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fill();

  // === WINGS ===
  ctx.shadowBlur = 4 * s;
  ctx.shadowColor = '#39FF14';

  // left wing
  ctx.beginPath();
  ctx.moveTo(0, -bodyW * 0.3);
  ctx.lineTo(-wingSpan * 0.4, -wingSpan * 0.7);
  ctx.lineTo(-wingSpan * 0.35, -wingSpan * 0.6);
  ctx.lineTo(0.08 * len, -bodyW * 0.8);
  ctx.closePath();
  const wingGrad = ctx.createLinearGradient(0, -bodyW * 0.3, -wingSpan * 0.4, -wingSpan * 0.7);
  wingGrad.addColorStop(0, '#c0c0c0');
  wingGrad.addColorStop(0.5, '#e0e0e0');
  wingGrad.addColorStop(1, '#909090');
  ctx.fillStyle = wingGrad;
  ctx.fill();

  // right wing
  ctx.beginPath();
  ctx.moveTo(0, bodyW * 0.3);
  ctx.lineTo(-wingSpan * 0.4, wingSpan * 0.7);
  ctx.lineTo(-wingSpan * 0.35, wingSpan * 0.6);
  ctx.lineTo(0.08 * len, bodyW * 0.8);
  ctx.closePath();
  ctx.fillStyle = wingGrad;
  ctx.fill();

  // === TAIL (vertical stabilizer) ===
  ctx.shadowBlur = 3 * s;
  ctx.beginPath();
  ctx.moveTo(-len * 0.2, -bodyW * 0.5);
  ctx.lineTo(-len * 0.25, -bodyW * 2.2);
  ctx.lineTo(-len * 0.22, -bodyW * 2.0);
  ctx.lineTo(-len * 0.1, -bodyW * 0.8);
  ctx.closePath();
  const tailGrad = ctx.createLinearGradient(-len * 0.2, -bodyW * 0.5, -len * 0.25, -bodyW * 2.2);
  tailGrad.addColorStop(0, '#aa3333');
  tailGrad.addColorStop(1, '#dd5555');
  ctx.fillStyle = tailGrad;
  ctx.fill();

  // === COCKPIT WINDOW ===
  ctx.shadowBlur = 4 * s;
  ctx.shadowColor = '#88ccff';
  ctx.beginPath();
  ctx.moveTo(len * 0.4, 0);
  ctx.quadraticCurveTo(len * 0.35, -bodyW * 0.5, len * 0.15, -bodyW * 0.4);
  ctx.lineTo(len * 0.15, bodyW * 0.4);
  ctx.quadraticCurveTo(len * 0.35, bodyW * 0.5, len * 0.4, 0);
  ctx.closePath();
  const cockpitGrad = ctx.createLinearGradient(len * 0.15, -bodyW * 0.4, len * 0.15, bodyW * 0.4);
  cockpitGrad.addColorStop(0, '#4488bb');
  cockpitGrad.addColorStop(0.5, '#66aadd');
  cockpitGrad.addColorStop(1, '#336699');
  ctx.fillStyle = cockpitGrad;
  ctx.fill();

  // cockpit reflection
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(len * 0.35, -bodyW * 0.15);
  ctx.quadraticCurveTo(len * 0.3, -bodyW * 0.3, len * 0.2, -bodyW * 0.25);
  ctx.lineTo(len * 0.2, -bodyW * 0.05);
  ctx.quadraticCurveTo(len * 0.3, -bodyW * 0.05, len * 0.35, -bodyW * 0.15);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fill();

  // === NOSE CONE ===
  ctx.shadowBlur = 6 * s;
  ctx.shadowColor = '#39FF14';
  ctx.beginPath();
  ctx.moveTo(len * 0.5, 0);
  ctx.quadraticCurveTo(len * 0.47, -bodyW * 0.3, len * 0.4, -bodyW * 0.4);
  ctx.lineTo(len * 0.4, bodyW * 0.4);
  ctx.quadraticCurveTo(len * 0.47, bodyW * 0.3, len * 0.5, 0);
  ctx.closePath();
  const noseGrad = ctx.createLinearGradient(len * 0.4, -bodyW * 0.4, len * 0.4, bodyW * 0.4);
  noseGrad.addColorStop(0, '#cc4444');
  noseGrad.addColorStop(0.5, '#ee6666');
  noseGrad.addColorStop(1, '#aa3333');
  ctx.fillStyle = noseGrad;
  ctx.fill();

  // === CONTRAILS (thin vapour trails behind wingtips) ===
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.15;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    const cx = -wingSpan * 0.35 * side;
    const cy = -wingSpan * 0.6 * side - bodyW * 0.2;
    ctx.moveTo(cx * 0.3, cy + 0.5);
    ctx.quadraticCurveTo(cx * 0.5 - side * 3, cy + 2, cx * 0.7, cy + 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawCrashExplosion(ctx, x, y, progress) {
  ctx.save();
  ctx.translate(x, y);
  const p = progress;

  ctx.strokeStyle = `rgba(255,200,50,${Math.max(0, 0.5 * (1 - p))})`;
  ctx.lineWidth = 2 * (1 - p);
  ctx.beginPath();
  ctx.arc(0, 0, p * 60, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 16; i++) {
    const a = (Math.PI * 2 / 16) * i + p * 0.5;
    const dist = p * (20 + Math.random() * 40);
    ctx.beginPath();
    ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 1 + Math.random() * 2.5 * (1 - p * 0.5), 0, Math.PI * 2);
    ctx.fillStyle = pick(['#ff4444', '#ff8800', '#ffcc00', '#ff6600', '#ffffff']);
    ctx.fill();
  }

  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2;
    const dist = p * (10 + Math.random() * 30);
    ctx.beginPath();
    ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 1 + Math.random() * 4 * (1 - p * 0.3), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,${100 + Math.floor(Math.random() * 100)},0,${Math.max(0, 0.7 * (1 - p * 0.3))})`;
    ctx.fill();
  }

  for (let i = 0; i < 5; i++) {
    const a = Math.random() * Math.PI * 2;
    const dist = p * (15 + Math.random() * 25);
    ctx.beginPath();
    ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 3 + Math.random() * 8 * p, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(80,80,80,${Math.max(0, 0.2 * (1 - p * 0.5))})`;
    ctx.fill();
  }

  const flash = ctx.createRadialGradient(0, 0, 0, 0, 0, 25 * (1 - p * 0.5));
  flash.addColorStop(0, `rgba(255,255,255,${Math.max(0, 0.4 * (1 - p))})`);
  flash.addColorStop(0.4, `rgba(255,200,50,${Math.max(0, 0.3 * (1 - p * 0.5))})`);
  flash.addColorStop(0.7, `rgba(255,100,0,${Math.max(0, 0.15 * (1 - p * 0.3))})`);
  flash.addColorStop(1, 'rgba(255,50,0,0)');
  ctx.fillStyle = flash;
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

// ====== FAKE PLAYERS ======
let fakeActivityId = 0;
const FAKE_AVATARS = [
  '#39FF14', '#FF6B6B', '#6BCBFF', '#FFD93D', '#FF8E53', '#A66CFF',
  '#FF6B6B', '#39FF14', '#FFD93D', '#6BCBFF', '#FF8E53', '#A66CFF',
  '#FF4444', '#FFD700', '#39FF14', '#FF6B6B', '#6BCBFF', '#A66CFF',
  '#FFD93D', '#FF8E53', '#FF4444', '#39FF14', '#FFD700', '#6BCBFF',
  '#FF6B6B', '#A66CFF', '#FF8E53', '#39FF14', '#FFD700', '#FF4444',
];
function generateFakeActivity(multiplier, state) {
  const idx = Math.floor(Math.random() * FAKE_NAMES.length);
  const name = FAKE_NAMES[idx];
  const avatarColor = FAKE_AVATARS[idx];
  const amt = Math.round(rand(100, 5000));
  const avatarUrl = `https://api.dicebear.com/7.x/identicon/png?seed=${name}&size=16`;
  if (state === 'flying') {
    const cashMult = parseFloat((1 + rand(0.1, Math.max(0.5, multiplier - 0.5))).toFixed(2));
    const win = Math.round(amt * cashMult);
    const actions = [
      { avatarUrl, name, text: `cashed out at ${cashMult.toFixed(2)}x & won ₹${win.toLocaleString('en-IN')}`, type: 'win', avatarColor },
      { avatarUrl, name, text: `bet ₹${amt.toLocaleString('en-IN')}`, type: 'bet', avatarColor },
    ];
    return { ...pick(actions), id: ++fakeActivityId };
  }
  if (state === 'crashed') {
    return { avatarUrl, name, text: `lost ₹${amt.toLocaleString('en-IN')}`, type: 'loss', avatarColor, id: ++fakeActivityId };
  }
  return { avatarUrl, name, text: `bet ₹${amt.toLocaleString('en-IN')}`, type: 'bet', avatarColor, id: ++fakeActivityId };
}

export default function AviatorGame() {
  const { user, refreshUser } = useAuth();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const animRef = useRef(null);
  const crashAnimRef = useRef(null);
  const soundRef = useRef(new SoundManager());
  const confettiRef = useRef(null);

  const [gameState, setGameState] = useState('waiting');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [crashMultiplier, setCrashMultiplier] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [points, setPoints] = useState([]);
  const [displayedMultiplier, setDisplayedMultiplier] = useState(1.0);
  const [crashProgress, setCrashProgress] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ w: 700, h: 400 });
  const [thrust, setThrust] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [screenShake, setScreenShake] = useState(false);
  const [showCrashPopup, setShowCrashPopup] = useState(false);
  const [popupMultiplier, setPopupMultiplier] = useState(null);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [winPopupAmount, setWinPopupAmount] = useState(null);
  const [userBets, setUserBets] = useState([]);
  const [fakeActivity, setFakeActivity] = useState([]);
  const [bet, setBet] = useState({ amount: '', autoCashout: '', betId: null, status: 'idle', payout: null, cashoutMultiplier: null });
  const [countdown, setCountdown] = useState(0);

  const lastMultiplierRef = useRef(1.0);
  const lastUpdateRef = useRef(Date.now());
  const gameStateRef = useRef(gameState);
  const pointsRef = useRef(points);
  const crashProgressRef = useRef(0);
  const displayedMultiplierRef = useRef(1.0);
  const thrustRef = useRef(1);
  const fakeTimerRef = useRef(null);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { pointsRef.current = points; }, [points]);

  useEffect(() => {
    soundRef.current.init();
    confettiRef.current = new ConfettiSystem(confettiCanvasRef);
    return () => { confettiRef.current?.destroy(); };
  }, []);

  useEffect(() => {
    fetchHistory();
    const pollInterval = setInterval(fetchGameState, 150);
    return () => {
      clearInterval(pollInterval);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (crashAnimRef.current) cancelAnimationFrame(crashAnimRef.current);
      if (fakeTimerRef.current) clearInterval(fakeTimerRef.current);
    };
  }, []);

  // Fake activity generator - always shows 3 entries, rotates every 1s
  useEffect(() => {
    if (fakeTimerRef.current) clearInterval(fakeTimerRef.current);
    const genItems = () => {
      const items = [];
      for (let i = 0; i < 3; i++) {
        items.push(generateFakeActivity(currentMultiplier, gameStateRef.current));
      }
      setFakeActivity(items);
    };
    genItems();
    fakeTimerRef.current = setInterval(genItems, 1000);
    return () => { if (fakeTimerRef.current) clearInterval(fakeTimerRef.current); };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'flying' && crashProgress === 0) {
      let running = true;
      const flicker = () => {
        if (!running) return;
        setThrust(0.7 + Math.random() * 0.4);
        thrustRef.current = 0.7 + Math.random() * 0.4;
        setTimeout(flicker, 40 + Math.random() * 60);
      };
      flicker();
      return () => { running = false; };
    } else {
      setThrust(1);
      thrustRef.current = 1;
    }
  }, [gameState, crashProgress]);

  useEffect(() => {
    if (gameState === 'crashed') {
      crashProgressRef.current = 0;
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const prog = Math.min(1, elapsed / 1200);
        crashProgressRef.current = prog;
        setCrashProgress(prog);
        if (prog < 1) crashAnimRef.current = requestAnimationFrame(animate);
      };
      crashAnimRef.current = requestAnimationFrame(animate);
    } else {
      setCrashProgress(0);
      crashProgressRef.current = 0;
    }
    return () => { if (crashAnimRef.current) cancelAnimationFrame(crashAnimRef.current); };
  }, [gameState]);

  useEffect(() => { drawCanvas(); }, [displayedMultiplier, gameState, crashMultiplier, points, crashProgress, canvasSize, thrust]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ w: rect.width, h: rect.height });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    const ro = new ResizeObserver(handleResize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => { window.removeEventListener('resize', handleResize); ro.disconnect(); };
  }, []);

  useEffect(() => {
    if (gameState === 'flying') {
      displayedMultiplierRef.current = currentMultiplier;
      let animating = true;
      const animate = () => {
        if (!animating) return;
        const target = currentMultiplier;
        const current = displayedMultiplierRef.current;
        const diff = target - current;
        if (Math.abs(diff) > 0.001) {
          displayedMultiplierRef.current += diff * 0.3;
          setDisplayedMultiplier(displayedMultiplierRef.current);
        } else {
          displayedMultiplierRef.current = target;
          setDisplayedMultiplier(target);
        }
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
      return () => { animating = false; if (animRef.current) cancelAnimationFrame(animRef.current); };
    } else if (gameState === 'waiting') {
      setDisplayedMultiplier(1.0);
      displayedMultiplierRef.current = 1.0;
    } else if (gameState === 'crashed' && crashMultiplier) {
      setDisplayedMultiplier(crashMultiplier);
      displayedMultiplierRef.current = crashMultiplier;
    }
  }, [gameState, currentMultiplier, crashMultiplier]);

  useEffect(() => {
    if (gameState === 'crashed') {
      setScreenShake(true);
      soundRef.current.crash();
      setBet(prev => prev.status === 'pending' ? { ...prev, status: 'lost', payout: 0 } : prev);
      setTimeout(() => fetchHistory(), 500);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'waiting') {
      setPoints([]);
      setBet(prev => ({ ...prev, betId: null, status: 'idle', payout: null, cashoutMultiplier: null }));
      fetchHistory();
    }
  }, [gameState]);

  useEffect(() => {
    if (screenShake) {
      const t = setTimeout(() => setScreenShake(false), 500);
      return () => clearTimeout(t);
    }
  }, [screenShake]);

  useEffect(() => {
    if (gameState === 'crashed' && crashMultiplier) {
      setPopupMultiplier(crashMultiplier);
      setShowCrashPopup(true);
      const t = setTimeout(() => setShowCrashPopup(false), 4000);
      return () => clearTimeout(t);
    } else {
      setShowCrashPopup(false);
    }
  }, [gameState, crashMultiplier]);

  // Engine sound during flight
  useEffect(() => {
    if (gameState === 'flying' && soundEnabled) {
      const interval = setInterval(() => {
        soundRef.current.engineHum(displayedMultiplierRef.current);
      }, 300);
      return () => clearInterval(interval);
    }
  }, [gameState, soundEnabled]);

  const fetchGameState = async () => {
    try {
      const { data } = await api.get('/game/state');
      if (!data.success) return;
      const gs = data.data;
      setGameState(gs.state);
      setCountdown(gs.countdown || 0);
      lastMultiplierRef.current = gs.multiplier || 1.0;
      lastUpdateRef.current = Date.now();

      if (gs.state === 'flying') {
        setCurrentMultiplier(gs.multiplier || 1.0);
        setPoints(p => {
          const n = [...p, { t: Date.now(), m: gs.multiplier || 1.0 }];
          const cutoff = Date.now() - 12000;
          return n.filter(x => x.t > cutoff).slice(-300);
        });
        if (gs.userBets) {
          for (const ub of gs.userBets) {
            setBet(prev => prev.betId === ub.id ? {
              ...prev,
              status: ub.status === 'cashed_out' ? 'cashed_out' : ub.status,
              payout: ub.status === 'cashed_out' ? ub.payout : prev.payout,
              cashoutMultiplier: ub.status === 'cashed_out' ? ub.cashOutAt : prev.cashoutMultiplier
            } : prev);
          }
        }
      } else if (gs.state === 'crashed') {
        const cm = gs.crashMultiplier || gs.multiplier || 1.0;
        setCrashMultiplier(cm);
        setCurrentMultiplier(cm);
      } else if (gs.state === 'waiting') {
        setCrashMultiplier(null);
        setCurrentMultiplier(1.0);
      }
      if (gs.history) setRoundHistory(gs.history.slice(-12));
      if (gs.recentBets) setUserBets(gs.recentBets);
    } catch {}
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/game/history');
      if (data.success && Array.isArray(data.data)) {
        const bets = data.data.slice(-10).reverse();
        setUserBets(bets);
        const currentState = gameStateRef.current;
        for (const b of bets) {
          if (b.status === 'pending' && currentState === 'flying') {
            setBet(prev => prev.betId ? prev : { ...prev, betId: b.id, status: 'pending' });
          } else if (b.status === 'cashed_out') {
            setBet(prev => prev.betId === b.id ? { ...prev, status: 'cashed_out', payout: parseFloat(b.payout), cashoutMultiplier: parseFloat(b.cash_out_at) } : prev);
          } else if (b.status === 'lost') {
            setBet(prev => prev.betId === b.id ? { ...prev, status: 'lost', payout: 0 } : prev);
          }
        }
      }
    } catch (err) {
      console.error('fetchHistory error:', err?.response?.data || err);
    }
  };

  const placeBet = async () => {
    const amt = parseFloat(bet.amount);
    if (!amt || amt < 10) return toast.error('Minimum bet is ₹10');
    if (amt > parseFloat(user?.balance || 0)) return toast.error('Insufficient balance');

    const autoCashout = bet.autoCashout ? parseFloat(bet.autoCashout) : null;
    if (autoCashout && (isNaN(autoCashout) || autoCashout < 1.01 || autoCashout > 50)) return toast.error('Auto cashout: 1.01x - 50x');

    try {
      const { data } = await api.post('/game/bet', { amount: amt, autoCashoutAt: autoCashout });
      if (data.success) {
        toast.success(`Bet placed: \u20B9${amt}`);
        soundRef.current.betPlaced();
        setBet(prev => ({ ...prev, betId: data.data.betId, status: 'pending', payout: null, cashoutMultiplier: null }));
        await refreshUser();
        fetchHistory();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const cashOut = async () => {
    if (!bet.betId || bet.status !== 'pending') return;
    try {
      const { data } = await api.post('/game/cashout', { betId: bet.betId });
      if (data.success) {
        const cm = data.data?.cashoutMultiplier || currentMultiplier;
        soundRef.current.cashOut();
        confettiRef.current?.burst(50);
        setWinPopupAmount(parseFloat(bet.amount) * parseFloat(cm));
        setShowWinPopup(true);
        setTimeout(() => setShowWinPopup(false), 4000);
        toast.success(`Cashed out at ${parseFloat(cm).toFixed(2)}x!`);
        setBet(prev => ({
          ...prev, status: 'cashed_out',
          payout: parseFloat(prev.amount) * parseFloat(cm),
          cashoutMultiplier: parseFloat(cm)
        }));
        await refreshUser();
        fetchHistory();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const toggleSound = () => {
    const enabled = soundRef.current.toggle();
    setSoundEnabled(enabled);
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;
    if (w === 0 || h === 0) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const pad = { top: 30, right: 24, bottom: 36, left: 52 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;
    ctx.clearRect(0, 0, w, h);

    // BG
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);

    // Stars
    const starSeed = 12345;
    for (let i = 0; i < 50; i++) {
      const sx = ((starSeed * (i + 1) * 7) % w);
      const sy = ((starSeed * (i + 1) * 13) % h);
      const sr = 0.2 + ((starSeed * (i + 1) * 17) % 3) * 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.05 + ((starSeed * (i + 1) * 11) % 5) * 0.04})`;
      ctx.fill();
    }

    // Vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // Grid
    const gridColor = gameState === 'crashed' ? 'rgba(255,50,50,0.04)' : 'rgba(57,255,20,0.04)';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const x = pad.left + (plotW / 5) * i;
      const y = pad.top + (plotH / 5) * i;
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = 'rgba(57,255,20,0.12)';
    ctx.font = '8px Inter';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (plotH / 5) * i;
      ctx.fillText((MAX_MULTIPLIER - (MAX_MULTIPLIER / 5) * i).toFixed(1) + 'x', pad.left - 5, y);
    }
    ctx.fillStyle = 'rgba(57,255,20,0.08)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= 5; i++) {
      ctx.fillText((i * 2) + 's', pad.left + (plotW / 5) * i, pad.top + plotH + 6);
    }

    const isFlyingOrCrashed = gameState === 'flying' || gameState === 'crashed';
    const pts = pointsRef.current;
    const pp = crashProgressRef.current;

    if (isFlyingOrCrashed && pts.length > 1) {
      const minT = pts[0].t;
      const maxT = pts[pts.length - 1].t;
      const range = Math.max(maxT - minT, 100);
      const dur = Math.min(range / 1000, 12);

      const mapX = (t) => pad.left + ((t - minT) / (dur * 1000)) * plotW;
      const mapY = (m) => pad.top + plotH - (Math.min(m, MAX_MULTIPLIER) / MAX_MULTIPLIER) * plotH;

      // Fill under curve
      const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
      if (gameState === 'crashed') {
        grad.addColorStop(0, 'rgba(255,50,50,0.06)');
        grad.addColorStop(1, 'rgba(255,50,50,0)');
      } else {
        grad.addColorStop(0, 'rgba(57,255,20,0.08)');
        grad.addColorStop(1, 'rgba(57,255,20,0)');
      }

      // Bezier curve
      if (pts.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(mapX(pts[0].t), mapY(pts[0].m));
        for (let i = 1; i < pts.length - 1; i++) {
          const xc = (mapX(pts[i].t) + mapX(pts[i + 1].t)) / 2;
          const yc = (mapY(pts[i].m) + mapY(pts[i + 1].m)) / 2;
          ctx.quadraticCurveTo(mapX(pts[i].t), mapY(pts[i].m), xc, yc);
        }
        ctx.lineTo(mapX(pts[pts.length - 1].t), mapY(pts[pts.length - 1].m));
        ctx.lineTo(mapX(pts[pts.length - 1].t), pad.top + plotH);
        ctx.lineTo(mapX(pts[0].t), pad.top + plotH);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      } else {
        // fallback for too few points
        ctx.beginPath();
        ctx.moveTo(pad.left, pad.top + plotH);
        for (let i = 0; i < pts.length; i++) ctx.lineTo(mapX(pts[i].t), mapY(pts[i].m));
        ctx.lineTo(mapX(pts[pts.length - 1].t), pad.top + plotH);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Draw the curve line with bezier
      const lineColor = gameState === 'crashed' ? '#ff3333' : getColor(displayedMultiplierRef.current);
      ctx.beginPath();
      ctx.moveTo(mapX(pts[0].t), mapY(pts[0].m));
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (mapX(pts[i].t) + mapX(pts[i + 1].t)) / 2;
        const yc = (mapY(pts[i].m) + mapY(pts[i + 1].m)) / 2;
        ctx.quadraticCurveTo(mapX(pts[i].t), mapY(pts[i].m), xc, yc);
      }
      ctx.lineTo(mapX(pts[pts.length - 1].t), mapY(pts[pts.length - 1].m));
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = gameState === 'crashed' ? 6 : 14;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Trail particles
      const trailCount = Math.min(18, pts.length - 1);
      for (let i = 0; i < trailCount; i++) {
        const idx = pts.length - 1 - i;
        const alpha = 0.3 * (1 - i / trailCount);
        const sz = (1.5 + Math.random() * 1.5) * (1 - i / trailCount);
        ctx.beginPath();
        ctx.arc(
          mapX(pts[idx].t) + (Math.random() - 0.5) * 3 * (i / trailCount),
          mapY(pts[idx].m) + (Math.random() - 0.5) * 3 * (i / trailCount),
          Math.max(0.3, sz), 0, Math.PI * 2
        );
        ctx.fillStyle = `rgba(255,${150 - i * 8},50,${alpha * 0.6})`;
        ctx.fill();
      }

      // Glowing trail dots
      for (let i = 0; i < trailCount; i++) {
        const idx = pts.length - 1 - i;
        const alpha = 0.5 * (1 - i / trailCount);
        const sz = 2 * (1 - i / trailCount * 0.5);
        ctx.beginPath();
        ctx.arc(mapX(pts[idx].t), mapY(pts[idx].m), Math.max(0.5, sz), 0, Math.PI * 2);
        ctx.fillStyle = lineColor.replace(')', `,${alpha})`);
        ctx.fill();
      }

      // Plane
      if (gameState === 'flying') {
        const lp = pts[pts.length - 1];
        const lx = mapX(lp.t);
        const ly = mapY(lp.m);

        let angle = -Math.PI / 4;
        if (pts.length > 2) {
          const p2 = pts[pts.length - 2];
          const p3 = pts[pts.length - 1];
          const dx = mapX(p3.t) - mapX(p2.t);
          const dy = mapY(p3.m) - mapY(p2.m);
          angle = Math.atan2(dy, dx);
        }

        const planeScale = Math.min(w, h) / 260;

        // Glow aura
        const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 25 * planeScale);
        const gc = getColor(displayedMultiplierRef.current);
        glow.addColorStop(0, gc.replace(')', ',0.12)'));
        glow.addColorStop(1, gc.replace(')', ',0)'));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lx, ly, 25 * planeScale, 0, Math.PI * 2);
        ctx.fill();

        drawPlane(ctx, lx, ly, angle, planeScale, thrustRef.current);
      }

      // Crash explosion
      if (gameState === 'crashed' && crashMultiplier) {
        const cy = mapY(crashMultiplier);

        ctx.strokeStyle = `rgba(255,50,50,${0.3 * (1 - pp * 0.5)})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(pad.left, cy);
        ctx.lineTo(pad.left + plotW, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = `rgba(255,50,50,${0.8 * (1 - pp * 0.3)})`;
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText('CRASHED', pad.left + 8, cy - 4);

        const crashX = mapX(pts.length > 0 ? pts[pts.length - 1].t : Date.now());
        drawCrashExplosion(ctx, crashX, cy, pp);
      }
    } else if (gameState === 'waiting') {
      const t = Date.now() / 1000;
      ctx.fillStyle = 'rgba(57,255,20,0.02)';
      for (let i = 0; i < 20; i++) {
        const x = pad.left + Math.sin(t + i * 1.7) * plotW * 0.4 + plotW * 0.5;
        const y = pad.top + Math.cos(t * 0.7 + i * 2.3) * plotH * 0.3 + plotH * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 1 + Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [gameState, crashMultiplier, points, displayedMultiplier, crashProgress, canvasSize]);

  const isBetActive = bet.status === 'pending' || bet.status === 'cashed_out' || bet.status === 'lost';

  return (
    <div className="p-1.5 sm:p-2 md:p-3 space-y-1.5 sm:space-y-2 min-h-full">
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <motion.div
            animate={gameState === 'flying' ? { y: [-1, 1, -1] } : { y: 0 }}
            transition={{ duration: 0.6, repeat: gameState === 'flying' ? Infinity : 0, ease: 'easeInOut' }}
          >
            <Zap size={16} className="text-neon-green sm:size-[18px]" />
          </motion.div>
          <span className="font-orbitron text-neon-green text-sm sm:text-base font-bold tracking-wider">AVIATOR</span>
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${
            gameState === 'flying'
              ? 'text-green-400 bg-green-500/15 border-green-500/20'
              : gameState === 'crashed'
              ? 'text-red-400 bg-red-500/15 border-red-500/20'
              : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/10'
          }`}>
            {gameState === 'flying' && (
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-green-400" />
            )}
            {gameState === 'crashed' && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
            {gameState === 'waiting' && <Clock size={10} className="animate-spin-slow" />}
            {gameState.toUpperCase()}
          </span>
          <button onClick={toggleSound} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
            {soundEnabled ? <Volume2 size={14} className="text-gray-400" /> : <VolumeX size={14} className="text-gray-600" />}
          </button>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto max-w-[55vw] sm:max-w-none scrollbar-none">
          {roundHistory.map((r, i) => {
            const m = typeof r.crashMultiplier === 'number' ? r.crashMultiplier : parseFloat(r.crashMultiplier || r);
            const colorClass = 'bg-green-500/20 text-green-400 border-green-500/20';
            return (
              <motion.span key={r.id || i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.03 }}
                className={`text-[9px] sm:text-[10px] font-orbitron px-1.5 py-0.5 rounded border whitespace-nowrap ${colorClass}`}>
                {(typeof m === 'number' ? m : parseFloat(m)).toFixed(2)}x
              </motion.span>
            );
          })}
        </div>
      </div>

      {/* ===== MAIN AREA ===== */}
      <div className="flex flex-col lg:flex-row gap-1.5 sm:gap-2">
        {/* Canvas */}
        <div className="flex-1 min-w-0">
          <div
            ref={containerRef}
            className={`aviator-bg rounded-xl border border-white/5 overflow-hidden relative ${screenShake ? 'screen-shake' : ''}`}
          >
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className={`absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 text-center transition-all duration-300 ${gameState === 'crashed' ? 'mt-4 sm:mt-6' : ''}`}>
                <AnimatePresence mode="wait">
                  {gameState === 'waiting' ? (
                    <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-700">
                        1.00<span className="text-xl sm:text-2xl md:text-3xl">x</span>
                      </p>
                      <motion.p animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                        className="text-gray-600 text-[10px] sm:text-xs font-orbitron mt-1 tracking-wider">
                        {countdown > 0 ? `NEXT ROUND IN ${countdown}s` : 'PREPARE FOR TAKEOFF'}
                      </motion.p>
                    </motion.div>
                  ) : gameState === 'flying' ? (
                    <motion.div key="flying" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <motion.p
                        animate={{ scale: displayedMultiplier > 5 ? [1, 1.02, 1] : 1 }}
                        transition={{ duration: 0.5, repeat: displayedMultiplier > 5 ? Infinity : 0 }}
                        className={`font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold transition-colors duration-200 ${
                          displayedMultiplier >= 10
                            ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                            : displayedMultiplier >= 5
                            ? 'text-orange-400 drop-shadow-[0_0_12px_rgba(255,140,0,0.25)]'
                            : displayedMultiplier >= 2
                            ? 'text-green-300 drop-shadow-[0_0_10px_rgba(127,255,0,0.2)]'
                            : 'neon-text multiplier-display'
                        }`}>
                        {displayedMultiplier.toFixed(2)}
                        <span className="text-xl sm:text-2xl md:text-3xl">x</span>
                      </motion.p>
                      <motion.p
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-gray-600 text-[8px] font-orbitron mt-0.5 tracking-widest uppercase"
                      >In Flight</motion.p>
                    </motion.div>
                  ) : (
                    <motion.div key="crashed" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                      <p className="font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.3)]">
                        {crashMultiplier ? crashMultiplier.toFixed(2) : '0.00'}
                        <span className="text-xl sm:text-2xl md:text-3xl">x</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <canvas ref={canvasRef} className="w-full h-[200px] sm:h-[260px] md:h-[340px] lg:h-[450px] block" />
            <canvas ref={confettiCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />
          </div>
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div className="w-full lg:w-[220px] xl:w-[260px] shrink-0 flex flex-col gap-1.5 sm:gap-2">
          {/* Live Activity Feed */}
          <div className="glass-card rounded-xl p-2.5 flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Users size={11} className="text-neon-green" />
              <span className="text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Live Activity</span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-green-400 ml-auto"
              />
            </div>
            <div className="h-[60px] sm:h-[70px] overflow-hidden">
              {fakeActivity.map((a, i) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-1 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-md mb-0.5 truncate ${
                    a.type === 'win'
                      ? 'bg-green-500/5 text-green-300'
                      : a.type === 'loss'
                      ? 'bg-red-500/5 text-red-300'
                      : 'bg-white/5 text-gray-400'
                  }`}
                >
                  <img src={a.avatarUrl} alt="" className="w-3.5 h-3.5 rounded-full shrink-0" />
                  <span className="font-semibold shrink-0">{a.name}</span>
                  <span className="truncate">{a.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Your Bets */}
          <div className="glass-card rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <History size={11} className="text-neon-green" />
              <span className="text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Recent</span>
            </div>
            <div className="space-y-1 max-h-[100px] sm:max-h-[120px] overflow-y-auto custom-scroll">
              {userBets.length === 0 ? (
                <p className="text-gray-600 text-[10px] text-center py-2">No bets yet</p>
              ) : (
                userBets.slice(0, 5).map((b, i) => {
                  const won = parseFloat(b.payout) > 0;
                  return (
                    <div key={b.id || i}
                      className="glass rounded-lg px-2 py-1 flex items-center justify-between">
                      <div>
                        <span className="text-white text-[9px] sm:text-[10px]">{'\u20B9'}{parseFloat(b.amount).toLocaleString('en-IN')}</span>
                        {b.cash_out_at && <span className="text-[8px] text-gray-500 ml-1">@{parseFloat(b.cash_out_at).toFixed(2)}x</span>}
                      </div>
                      <span className={`text-[9px] sm:text-[10px] font-orbitron ${won ? 'neon-text' : 'text-red-400'}`}>
                        {won ? `+${'\u20B9'}${parseFloat(b.payout).toLocaleString('en-IN')}` : 'Lost'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM BET CONTROLS ===== */}
      <div className="glass-card rounded-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          {/* Left: Bet Amount */}
          <div className="w-full sm:w-auto sm:flex-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block font-orbitron">Bet Amount</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setBet(prev => ({ ...prev, amount: Math.max(10, (parseFloat(prev.amount) || 100) - 100) }))}
                disabled={isBetActive || gameState === 'crashed' || gameState === 'flying'}
                className="btn-dark w-8 h-9 rounded-lg flex items-center justify-center text-base font-bold shrink-0 disabled:opacity-30"
              >−</button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={bet.amount}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setBet(prev => ({ ...prev, amount: val }));
                }}
                placeholder="Amount"
                disabled={isBetActive || gameState === 'crashed' || gameState === 'flying'}
                className="input-neon flex-1 rounded-lg px-3 py-2 text-sm text-center font-orbitron"
              />
              <button
                onClick={() => setBet(prev => ({ ...prev, amount: (parseFloat(prev.amount) || 100) + 100 }))}
                disabled={isBetActive || gameState === 'crashed' || gameState === 'flying'}
                className="btn-dark w-8 h-9 rounded-lg flex items-center justify-center text-base font-bold shrink-0 disabled:opacity-30"
              >+</button>
            </div>
            <div className="flex gap-1 mt-1.5">
              {QUICK_AMOUNTS.map(a => (
                <button key={a} onClick={() => setBet(prev => ({ ...prev, amount: a }))}
                  disabled={isBetActive || gameState === 'crashed' || gameState === 'flying'}
                  className={`btn-dark flex-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all active:scale-95 disabled:opacity-30 ${
                    parseFloat(bet.amount) === a ? 'border-neon-green/30 bg-neon-green/5' : ''
                  }`}>
                  {'\u20B9'}{a}
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Auto Cashout */}
          <div className="w-full sm:w-[160px]">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block font-orbitron">Auto Cashout</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setBet(prev => ({ ...prev, autoCashout: Math.max(1.01, (parseFloat(prev.autoCashout) || 1.5) - 0.1).toFixed(2) }))}
                disabled={isBetActive || gameState === 'crashed' || gameState === 'flying'}
                className="btn-dark w-7 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 disabled:opacity-30"
              >−</button>
              <input
                type="number"
                value={bet.autoCashout}
                onChange={e => setBet(prev => ({ ...prev, autoCashout: e.target.value }))}
                placeholder="1.5x"
                min="1.01" max="50" step="0.01"
                disabled={isBetActive || gameState === 'crashed' || gameState === 'flying'}
                className="input-neon flex-1 rounded-lg px-2 py-2 text-sm text-center font-orbitron"
              />
              <button
                onClick={() => setBet(prev => ({ ...prev, autoCashout: Math.min(50, (parseFloat(prev.autoCashout) || 1.5) + 0.1).toFixed(2) }))}
                disabled={isBetActive || gameState === 'crashed' || gameState === 'flying'}
                className="btn-dark w-7 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 disabled:opacity-30"
              >+</button>
            </div>
          </div>

          {/* Right: Buttons */}
          <div className="w-full sm:w-auto flex gap-2">
            {gameState === 'waiting' && !isBetActive ? (
              <button
                onClick={placeBet}
                disabled={!bet.amount || parseFloat(bet.amount) <= 0}
                className="btn-neon flex-1 sm:flex-none sm:min-w-[120px] py-2.5 px-6 rounded-lg text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                Place Bet
              </button>
            ) : !isBetActive ? null : bet.status === 'pending' && bet.autoCashout ? (
              <div className="flex-1 sm:flex-none text-center px-4 py-2">
                <p className="text-gray-500 text-[10px] font-bold uppercase">Auto Target</p>
                <p className="font-orbitron text-gray-400 text-sm">{parseFloat(bet.autoCashout).toFixed(2)}x</p>
              </div>
            ) : bet.status === 'pending' ? (
              <button
                onClick={cashOut}
                disabled={gameState !== 'flying'}
                className={`flex-1 sm:flex-none sm:min-w-[120px] py-2.5 px-6 rounded-lg text-xs font-bold relative overflow-hidden transition-all active:scale-[0.98] ${
                  gameState === 'flying'
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-[0_0_20px_rgba(57,255,20,0.2)]'
                    : 'btn-dark opacity-50'
                }`}
              >
                Cash Out
                {gameState === 'flying' && (
                  <motion.span
                    animate={{ opacity: [0, 0.15, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute inset-0 bg-white pointer-events-none"
                  />
                )}
              </button>
            ) : bet.status === 'cashed_out' ? (
              <div className="flex-1 sm:flex-none text-center px-4 py-2">
                <p className="text-green-400 text-[10px] font-bold">WON!</p>
                <p className="font-orbitron neon-text text-sm">+{'\u20B9'}{(bet.payout || 0).toLocaleString('en-IN')}</p>
              </div>
            ) : (
              <div className="flex-1 sm:flex-none text-center px-4 py-2">
                <p className="text-red-400 text-[10px] font-bold">LOST</p>
                <p className="font-orbitron text-red-400/70 text-sm">-{'\u20B9'}{parseFloat(bet.amount).toLocaleString('en-IN')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== POPUPS ===== */}
      <AnimatePresence>
        {showWinPopup && winPopupAmount != null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-[#0a0a0a] border border-green-500/20 rounded-2xl px-8 py-6 text-center shadow-[0_0_60px_rgba(57,255,20,0.1)] max-w-sm mx-4 pointer-events-auto">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.5, repeat: 2 }} className="text-5xl mb-3">🎉</motion.div>
              <h2 className="font-orbitron text-lg font-bold text-green-400 mb-1">Hooray! You Won!</h2>
              <p className="font-orbitron text-3xl font-bold neon-text mb-3">
                +{'\u20B9'}{winPopupAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
              <p className="text-gray-500 text-xs">Okay, try once more!</p>
              <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 4, ease: 'linear' }} className="h-0.5 bg-green-500/30 rounded-full mt-4 mx-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCrashPopup && popupMultiplier && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-[#0a0a0a] border border-red-500/20 rounded-2xl px-8 py-6 text-center shadow-[0_0_60px_rgba(255,0,0,0.15)] max-w-sm mx-4 pointer-events-auto">
              <motion.div animate={{ rotate: [0, -5, 5, -5, 0] }} transition={{ duration: 0.4 }} className="text-5xl mb-3">💥</motion.div>
              <h2 className="font-orbitron text-lg font-bold text-red-400 mb-1">Oh no! Crashed!</h2>
              <p className="font-orbitron text-3xl font-bold text-red-500 mb-2">{popupMultiplier.toFixed(2)}<span className="text-lg">x</span></p>
              <p className="text-gray-500 text-xs">Please try again next round</p>
              <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 4, ease: 'linear' }} className="h-0.5 bg-red-500/30 rounded-full mt-4 mx-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
