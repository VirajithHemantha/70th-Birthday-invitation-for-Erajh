import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { Sparkles, MapPin, Mail } from 'lucide-react';

/* ───────── Flip Card ───────── */
function FlipCard({
  front,
  back,
  className,
  containerClassName,
  rounded = 'rounded-[2rem]',
  ...props
}: {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  containerClassName?: string;
  rounded?: string;
  [key: string]: any;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-100, 100], [15, -15]);
  const rotateY = useTransform(mouseX, [-100, 100], [-15, 15]);
  const springConfig = { damping: 20, stiffness: 300 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
    const handler = () => setIsTouchDevice(mq.matches);
    handler();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
    } else {
      (mq as any).addListener(handler);
    }
    return () => {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', handler);
      } else {
        (mq as any).removeListener(handler);
      }
    };
  }, []);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseX.set(e.clientX - cx);
    mouseY.set(e.clientY - cy);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setIsFlipped(false);
  }

  function handleClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target?.closest('[data-no-flip]')) return;
    setIsFlipped((prev) => !prev);
  }

  return (
    <motion.div
      {...props}
      ref={ref}
      className={`perspective-1000 cursor-pointer relative ${containerClassName || ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { if (!isTouchDevice) setIsFlipped(true); }}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ rotateX: isFlipped ? 0 : springRotateX, rotateY: isFlipped ? 0 : springRotateY }}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className={`w-full h-full transform-style-3d relative ${className || ''}`}
        style={{ WebkitTransformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 backface-hidden flip-face w-full h-full ${rounded} overflow-hidden shadow-2xl border border-sage/40 ring-1 ring-black/5`}
          style={{ transform: 'rotateY(0deg) translateZ(1px)', WebkitTransform: 'rotateY(0deg) translateZ(1px)' }}
        >
          {front}
          <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-white/30 rounded-tl-lg" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-white/30 rounded-br-lg" />
        </div>

        {/* Back */}
        <div
          style={{ transform: 'rotateY(180deg) translateZ(1px)', WebkitTransform: 'rotateY(180deg) translateZ(1px)' }}
          className={`absolute inset-0 backface-hidden flip-face w-full h-full bg-paper border border-sage/20 ${rounded} flex flex-col justify-center items-center text-center p-3 md:p-8 shadow-2xl overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none" />
          <div className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-sage/10 rounded-tl-xl" />
          <div className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-sage/10 rounded-br-xl" />
          <div className="relative z-10 w-full h-full flex flex-col py-4 overflow-y-auto overflow-x-hidden ios-scroll">
            {back}
          </div>
        </div>
      </motion.div>

      {/* Tap to reveal hint (touch devices) */}
      <AnimatePresence>
        {isTouchDevice && !isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.4 } }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none z-50"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="flex items-center gap-2 bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25 shadow-xl"
            >
              <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
                <motion.span
                  animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-white/70"
                />
                <span className="relative w-2 h-2 rounded-full bg-white shadow-sm" />
              </span>
              <span
                className="text-white text-[9px] uppercase tracking-[0.2em] font-bold whitespace-nowrap"
                style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.18em' }}
              >
                Tap to reveal
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────── RSVP Card ───────── */
function RSVPCard() {
  const endpoint = 'https://script.google.com/macros/s/AKfycbwUyj3PlOGPvh2G32TrKRNgjP3YhkfYuVA-swO-Zfm8N2ZFICyNeZh-iueER3uIP0EU_Q/exec';
  const [attendance, setAttendance] = useState('yes');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function validate() {
    return name.trim() ? null : 'Please enter your name.';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    const err = validate();
    if (err) { setError(err); return; }

    const payload = {
      type: 'rsvp',
      attendance,
      name,
      submittedAt: new Date().toISOString(),
    };
    setSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSuccess('RSVP saved. Thank you!');
    } catch {
      try {
        const fd = new FormData();
        fd.append('payload', JSON.stringify(payload));
        await fetch(endpoint, { method: 'POST', mode: 'no-cors', body: fd });
        setSuccess('RSVP submitted. Thank you!');
      } catch {
        setError('Could not submit RSVP. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full relative bg-paper border border-sage/20 rounded-[2rem] flex flex-col justify-center items-center text-center px-4 py-8 md:p-10 shadow-2xl overflow-hidden min-h-[480px] md:min-h-[400px]">
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none" />
      <div className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-sage/10 rounded-tl-xl" />
      <div className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-sage/10 rounded-br-xl" />

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col h-full justify-center">
        <Mail size={32} className="text-sage mb-4 md:mb-4 mx-auto opacity-70 md:w-8 md:h-8" />
        <h4 className="serif text-4xl md:text-3xl text-sage mb-3 md:mb-3 text-center">RSVP</h4>
        <p className="text-xs md:text-sm text-stone-400 uppercase tracking-widest mb-6 md:mb-6 text-center leading-relaxed">
          Please let us know by<br />September 15th, 2026
        </p>
        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-4 w-full px-1 md:px-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-sage/20 bg-black/40 px-4 py-4 md:py-3 text-sm text-stone-300 outline-none focus:border-sage/50 transition-colors text-center"
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAttendance('yes')}
              className={`py-4 md:py-3 rounded-xl text-xs uppercase tracking-widest font-bold border transition-colors ${attendance === 'yes' ? 'gold-gradient-bg text-paper border-sage' : 'bg-sand/40 text-sage border-sand/30'}`}
            >
              Attending
            </button>
            <button
              type="button"
              onClick={() => setAttendance('no')}
              className={`py-4 md:py-3 rounded-xl text-xs uppercase tracking-widest font-bold border transition-colors ${attendance === 'no' ? 'bg-stone-800 text-white border-stone-800' : 'bg-sand/40 text-stone-400 border-sand/30'}`}
            >
              Not Attending
            </button>
          </div>
          {error && <p className="text-xs md:text-sm text-red-700 font-semibold">{error}</p>}
          {success && <p className="text-xs md:text-sm text-sage font-bold">{success}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full gold-gradient-bg shimmer text-paper py-4 md:py-3 mt-2 rounded-xl text-xs md:text-sm uppercase tracking-widest font-bold disabled:opacity-60 shadow-lg shadow-gold/20"
          >
            {submitting ? 'Submitting...' : 'Submit RSVP'}
          </button>
        </form>
        <p className="mt-6 text-[10px] md:text-xs text-sage/80 uppercase tracking-widest font-medium leading-relaxed">
          For further details, contact<br/>Shehara (Daughter) on 0778567867
        </p>
      </div>
    </div>
  );
}

/* ───────── Main App ───────── */
export default function App() {
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isSmall, setIsSmall] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Detect small screens
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = () => setIsSmall(mq.matches);
    handler();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      (mq as any).addListener(handler);
      return () => (mq as any).removeListener(handler);
    }
  }, []);

  // Detect reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setPrefersReduced(mq.matches);
    handler();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      (mq as any).addListener(handler);
      return () => (mq as any).removeListener(handler);
    }
  }, []);

  const isIOS = typeof navigator < 'u' && (/iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const skipAnimations = prefersReduced || isIOS;

  const openEnvelope = () => {
    setEnvelopeOpened(true);
    setTimeout(() => {
      setShowContent(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  // Audio control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    if (muted) { audio.pause(); return; }
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [muted]);

  return (
    <div className="min-h-screen bg-paper text-white selection:bg-sage/40 overflow-x-hidden relative">
      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-sage origin-left z-[1000]" style={{ scaleX }} />

      {/* ═══════ ENVELOPE OVERLAY ═══════ */}
      <AnimatePresence>
        {!showContent && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, delay: 0.5 } }}
            className="fixed inset-0 z-[100] bg-paper/95 backdrop-blur-md flex items-center justify-center p-6 overflow-hidden"
          >
            {/* Top text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
              className="absolute top-12 md:top-24 left-0 right-0 text-center z-10 pointer-events-none px-4"
            >
              <div className="flex flex-col items-center gap-2 md:gap-3">
                {/* Top ornament */}
                <div className="flex items-center gap-3 fancy-ornament">
                  <span className="text-sage/50 text-xs md:text-sm">✦</span>
                  <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent via-sage/40 to-transparent" />
                  <span className="text-sage/50 text-xs md:text-sm">✦</span>
                </div>

                {/* "You Are Invited" in script font */}
                <h2 className="script text-3xl sm:text-4xl md:text-6xl gold-gradient-text shimmer fancy-title leading-tight drop-shadow-md">
                  You Are Invited
                </h2>

                {/* "to" connector */}
                <p className="text-[10px] sm:text-xs md:text-sm text-sage/50 uppercase tracking-[0.5em] font-light italic">
                  — to —
                </p>

                {/* Name */}
                <h3 className="serif text-xl sm:text-2xl md:text-4xl gold-gradient-text shimmer font-light tracking-[0.1em] md:tracking-[0.15em] drop-shadow-lg">
                  Erajh Alahakoon's
                </h3>

                {/* "70th Birthday" with sparkles */}
                <div className="flex items-center gap-2 md:gap-4">
                  <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-sage/60 fancy-sparkle" />
                  <span className="text-lg sm:text-2xl md:text-4xl font-bold tracking-[0.15em] md:tracking-[0.25em] uppercase gold-gradient-text shimmer fancy-title"
                    style={{ fontFamily: '"Cormorant Garamond", serif' }}
                  >
                    70th Birthday
                  </span>
                  <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-sage/60 fancy-sparkle" style={{ animationDelay: '0.5s' }} />
                </div>

                {/* Bottom ornament */}
                <div className="flex items-center gap-3 fancy-ornament" style={{ animationDelay: '1.5s' }}>
                  <span className="text-sage/50 text-xs md:text-sm">✦</span>
                  <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent via-sage/40 to-transparent" />
                  <span className="text-sage/50 text-xs md:text-sm">✦</span>
                </div>
              </div>
              <div className="bg-black/60 border border-sage/40 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 md:mb-8 inline-block backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.25)] mt-4 md:mt-6">
                <p className="text-[10px] sm:text-xs md:text-sm font-bold italic gold-gradient-text tracking-wider uppercase">
                  Shhh… It's a surprise! Let's keep this celebration a secret from Erajh!
                </p>
              </div>
            </motion.div>

            {/* Bokeh background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{ x: ['-10%', '10%', '-10%'], y: ['-5%', '5%', '-5%'], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-[30%] -left-[20%] w-[140%] h-[140%] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.25)_0%,transparent_60%)] blur-3xl"
              />
              <motion.div
                animate={{ x: ['10%', '-10%', '10%'], y: ['5%', '-5%', '5%'], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-[30%] -right-[20%] w-[140%] h-[140%] rounded-full bg-[radial-gradient(circle,rgba(140,109,49,0.2)_0%,transparent_60%)] blur-3xl"
              />
              {!skipAnimations &&
                [...Array(12)].map((_, i) => (
                  <motion.div
                    key={`bokeh-${i}`}
                    className="absolute rounded-full mix-blend-soft-light"
                    style={{
                      backgroundColor: i % 2 === 0 ? '#785E1E' : '#F9D99A',
                      opacity: 0.25,
                      width: Math.random() * 150 + 100 + 'px',
                      height: Math.random() * 150 + 100 + 'px',
                      left: `${Math.random() * 100}%`,
                      bottom: '-20%',
                      filter: `blur(${Math.random() * 20 + 30}px)`,
                    }}
                    animate={{
                      y: [0, -1200],
                      x: [(Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400],
                      opacity: [0, 0.4, 0],
                    }}
                    transition={{ duration: 25 + Math.random() * 35, repeat: Infinity, delay: Math.random() * 20, ease: 'linear' }}
                  />
                ))}
            </div>

            {/* ───── Envelope ───── */}
            <motion.div
              layoutId="envelope-box"
              style={{ perspective: 1500 }}
              animate={!skipAnimations && !envelopeOpened ? { y: [0, -10, 0] } : {}}
              transition={skipAnimations ? { duration: 0 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative mt-48 sm:mt-32 md:mt-0 w-full max-w-2xl h-80 md:h-[450px] rounded-[2.25rem] shadow-[0_34px_80px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center z-10 overflow-hidden"
            >
              {/* Envelope body */}
              <div className="absolute inset-0 bg-gradient-to-br from-taupe via-sage to-taupe/80 shadow-inner" />
              <div className="absolute inset-0 opacity-25 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/16 via-transparent to-umber/25 pointer-events-none" />
              <div className="absolute inset-[10px] rounded-[1.8rem] border border-white/18 pointer-events-none" />
              <div className="absolute inset-[16px] rounded-[1.55rem] border border-umber/10 pointer-events-none" />

              {/* Glow */}
              {!skipAnimations && (
                <motion.div
                  animate={{ opacity: [0.18, 0.32, 0.18], scale: [1, 1.04, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-20 left-1/2 -translate-x-1/2 w-[520px] h-[260px] bg-paper/15 blur-3xl rounded-full pointer-events-none"
                />
              )}

              {/* Envelope label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pb-32 md:pb-40 space-y-4 md:space-y-6 z-25">
                <div className="w-10 md:w-16 h-px bg-white/20" />
              </div>

              {/* Bottom V */}
              <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-white/5 clip-path-envelope-bottom pointer-events-none rounded-b-[2rem]" />
              <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-gradient-to-t from-umber/35 via-umber/10 to-transparent clip-path-envelope-bottom pointer-events-none rounded-b-[2rem]" />

              {/* Top flap */}
              <motion.div
                initial={{ rotateX: 0 }}
                animate={{ rotateX: envelopeOpened ? 180 : 0, opacity: envelopeOpened ? 0 : 1 }}
                transition={{ duration: 1, ease: [0.3, 0.1, 0.2, 1] }}
                style={{ transformOrigin: 'top', backfaceVisibility: 'hidden' }}
                className="absolute top-0 left-0 right-0 h-[55%] drop-shadow-2xl z-20 rounded-t-[2.25rem] clip-path-envelope flex flex-col items-center justify-start overflow-hidden pt-8 pointer-events-none"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-taupe via-sage to-taupe/90" />
                <div className="absolute inset-0 opacity-22 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/18 via-transparent to-umber/25" />
                <div className="absolute top-0 left-0 right-0 h-px bg-white/25" />
              </motion.div>

              {/* Seal button */}
              {!envelopeOpened && (
                <motion.div
                  initial={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center cursor-pointer"
                  onClick={openEnvelope}
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={skipAnimations ? { duration: 0 } : { repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="flex flex-col items-center gap-4 mt-8 md:mt-12 group"
                  >
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-[0_18px_50px_-18px_rgba(0,0,0,0.65)] flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500 bg-paper/10 border border-white/30 p-1.5 backdrop-blur-md">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/14 via-transparent to-umber/25 pointer-events-none" />
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-sienna via-sage to-taupe shadow-[inset_0_-8px_18px_rgba(0,0,0,0.28),0_8px_18px_rgba(0,0,0,0.22)] flex items-center justify-center border border-white/14 relative overflow-hidden">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-12 bg-paper/25 blur-2xl rounded-full" />
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.35)_0%,transparent_55%)]" />
                        <Sparkles className="relative text-paper/90 w-10 h-10 md:w-14 md:h-14 drop-shadow-md mt-1" />
                      </div>
                    </div>
                    <motion.div
                      animate={skipAnimations ? { y: 0 } : { y: [0, 5, 0] }}
                      transition={skipAnimations ? { duration: 0 } : { repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    >
                      <p className="serif text-white/75 tracking-[0.32em] uppercase text-[10px] md:text-xs whitespace-nowrap">
                        Tap to break seal
                      </p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ BACKGROUND IMAGE ═══════ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src="/bg-black-gold.png" alt="Background" className="w-full h-full object-cover opacity-[0.5] md:opacity-[0.6]" />
        <div className="absolute inset-0 bg-gradient-to-b from-paper/80 via-transparent to-paper/80" />
      </div>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <motion.main
        initial={false}
        animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
        transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
        className="max-w-[1600px] mx-auto px-4 py-10 sm:py-12 md:px-12 md:py-24 flex flex-col gap-10 md:gap-16 relative z-10 min-h-screen"
      >
        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={showContent ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
          className="text-center space-y-4 md:space-y-8 mt-4 md:mt-12"
        >


          <h1 className="flex flex-col items-center px-2">
            <span className="serif italic text-3xl sm:text-5xl md:text-[8rem] gold-gradient-text font-light leading-tight drop-shadow-sm mb-1 md:mb-6">
              You're Invited!
            </span>
            <span className="serif text-sm sm:text-base md:text-4xl gold-gradient-text tracking-[0.15em] md:tracking-[0.3em] uppercase font-light">
              to celebrate the 70th birthday of
            </span>
          </h1>

          {/* Photo + Name */}
          <div className="flex flex-col items-center justify-center mt-4 md:mt-12 relative w-full px-2">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-48 bg-sage/10 blur-[80px] rounded-full pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={showContent ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 1.2, duration: 1.5, ease: 'easeOut' }}
              className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto mb-6 md:mb-10 relative group z-20"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#C9B99A]/30 to-transparent blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
              <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-[#C9B99A]/40 shadow-[0_0_40px_rgba(201,185,154,0.2)] relative z-10">
                <img src="/erajh.jpeg" alt="Erajh Alahakoon" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
                <div className="absolute inset-0 rounded-full border-[2px] border-black/20 pointer-events-none" />
              </div>
              <div className="absolute -inset-4 md:-inset-6 rounded-full border border-[#C9B99A]/30 scale-95 group-hover:scale-100 transition-transform duration-1000" />
              <div className="absolute -inset-8 md:-inset-12 rounded-full border border-[#C9B99A]/20 border-dashed scale-105 group-hover:rotate-12 transition-all duration-[3000ms]" />
            </motion.div>

            <motion.h2
              whileHover={{ scale: 1.05 }}
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
              className="text-[10vw] sm:text-5xl md:text-[6rem] gold-gradient-text shimmer drop-shadow-lg relative z-10 leading-relaxed px-1 text-center"
            >
              Erajh Alahakoon
            </motion.h2>
          </div>

          <div className="w-24 md:w-32 h-px bg-gradient-to-r from-transparent via-sage/40 to-transparent mx-auto mt-8" />
        </motion.div>

        {/* ── Envelope Card (opened) ── */}
        <div className="flex justify-center w-full mb-8 mt-12 md:mt-28">
          {showContent ? (
            <motion.div
              layoutId="envelope-box"
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-4xl relative cursor-default"
              style={{ height: isSmall ? '520px' : 'clamp(420px, 52vw, 620px)' }}
            >
              {/* Glow */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.28, 0.45, 0.28] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-x-6 sm:inset-x-10 top-[24%] h-44 sm:h-52 bg-sage/25 blur-[70px] rounded-full pointer-events-none z-0"
              />
              <div className="absolute inset-x-10 top-[18%] h-20 bg-sage/12 blur-[50px] rounded-full pointer-events-none z-0" />

              {/* Specks */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={`envelope-speck-${i}`}
                    className={`absolute rounded-full ${i % 2 === 0 ? 'bg-sand' : 'bg-sage'}`}
                    style={{
                      width: `${Math.random() * 6 + 3}px`,
                      height: `${Math.random() * 6 + 3}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 60 + 8}%`,
                      opacity: 0.12,
                      filter: 'blur(1px)',
                    }}
                    animate={{ y: [0, -18, 0], x: [0, (Math.random() - 0.5) * 14, 0], opacity: [0.08, 0.2, 0.08] }}
                    transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3, ease: 'easeInOut' }}
                  />
                ))}
              </div>

              {/* Bottom envelope */}
              <div className="absolute bottom-0 left-0 right-0 h-[64%] sm:h-[66%] md:h-[68%] rounded-b-[2.5rem] overflow-hidden z-10 shadow-[0_24px_70px_-12px_rgba(61,34,21,0.55)]">
                <div className="absolute inset-0 bg-gradient-to-b from-umber via-taupe/40 to-sienna/50" />
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-umber/25" />
                <div className="absolute inset-x-0 top-0 h-[2px] bg-white/8" />
                <div className="absolute inset-x-10 top-3 h-px bg-sand/15" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
                <div className="absolute top-0 bottom-0 left-0 w-px bg-white/8" />
                <div className="absolute top-0 bottom-0 right-0 w-px bg-white/8" />
                <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
                  <div className="w-16 h-px bg-sand/45" />
                  <p className="serif italic text-sand/55 text-[10px] tracking-[0.4em] uppercase">Official Invite · 2026</p>
                  <div className="w-16 h-px bg-sand/45" />
                </div>
              </div>

              {/* Back flap V */}
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none overflow-hidden"
                style={{ bottom: isSmall ? '62.5%' : '66.2%', height: isSmall ? '33%' : '40%' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-umber/95 via-taupe/70 to-sienna/70" style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}>
                  <div className="absolute inset-0 opacity-25 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/0 to-transparent" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-taupe via-sage to-taupe/80" style={{ clipPath: 'polygon(3% 100%, 50% 10%, 97% 100%)' }}>
                  <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/0 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-umber/35 to-transparent" />
              </div>

              {/* Letter card */}
              <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: isSmall ? -46 : -58, opacity: 1 }}
                transition={{ duration: 1.4, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-3 right-3 sm:left-6 sm:right-6 md:left-16 md:right-16 z-20"
                style={{ bottom: isSmall ? '30%' : '33%', top: 'auto' }}
              >
                <div className="absolute -bottom-4 left-6 right-6 h-10 bg-umber/20 blur-xl rounded-full" />
                <div className="relative bg-paper rounded-[1.6rem] md:rounded-[2rem] shadow-[0_-20px_60px_rgba(0,0,0,0.16),0_10px_30px_rgba(0,0,0,0.08)] border border-sage/35 overflow-hidden">
                  {/* Decorations */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-sage/12 blur-3xl rounded-full" />
                    <div className="absolute inset-[10px] border border-taupe/25 rounded-[1.1rem] md:rounded-xl" />
                    <div className="absolute inset-[16px] border border-sage/15 rounded-[0.9rem] md:rounded-lg" />
                    {([['top-3 left-3', 'rotate-0'], ['top-3 right-3', 'rotate-90'], ['bottom-3 left-3', '-rotate-90'], ['bottom-3 right-3', 'rotate-180']] as const).map(([pos, rot], idx) => (
                      <div key={idx} className={`absolute ${pos} w-7 h-7`}>
                        <svg viewBox="0 0 28 28" fill="none" className={`w-full h-full ${rot} opacity-40`}>
                          <path d="M2 2 C2 2, 14 2, 14 14" stroke="rgb(156 132 112)" strokeWidth="0.8" fill="none" />
                          <path d="M2 2 C8 2, 2 8, 2 14" stroke="rgb(156 132 112)" strokeWidth="0.8" fill="none" />
                          <circle cx="4" cy="4" r="1.2" fill="rgb(196 113 74)" opacity="0.5" />
                          <path d="M6 2 C6 2, 6 6, 10 6" stroke="rgb(196 113 74)" strokeWidth="0.6" fill="none" opacity="0.5" />
                        </svg>
                      </div>
                    ))}
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ repeat: Infinity, duration: 4.6, delay: 2, ease: 'easeInOut' }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12"
                    />
                  </div>

                  {/* Letter content */}
                  <div className="relative z-10 px-4 pt-5 pb-4 sm:px-6 sm:pt-7 sm:pb-7 md:px-10 md:py-8 flex flex-col items-center text-center gap-0 sm:gap-2 md:gap-3">
                    {/* Top divider */}
                    <div className="flex items-center gap-3 w-full max-w-[240px]">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-taupe/55" />
                      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}>
                        <svg viewBox="0 0 16 16" className="w-3 h-3 opacity-50 text-sage" fill="currentColor">
                          <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" />
                        </svg>
                      </motion.div>
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-taupe/55" />
                    </div>

                    {/* Monogram */}
                    <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} className="mb-4 md:mb-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 rounded-full border border-sage/20 flex items-center justify-center bg-paper/40 backdrop-blur-sm shadow-lg mx-auto relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-sage/5 to-transparent pointer-events-none" />
                        <span style={{ fontFamily: '"Times New Roman", Times, serif' }} className="text-2xl sm:text-4xl md:text-6xl gold-gradient-text shimmer select-none leading-relaxed px-2">
                          EA
                        </span>
                      </div>
                    </motion.div>

                    <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-sage/80 font-medium mb-3">JOIN US IN CELEBRATING</p>

                    <div className="space-y-0.5">
                      <p className="text-[10px] sm:text-[12px] md:text-[14px] uppercase tracking-[0.3em] text-sage font-bold leading-relaxed">SEVENTY WONDERFUL YEARS OF</p>
                    </div>

                    <div className="flex flex-col items-center justify-center max-w-full px-4 mt-2">
                      <span className="script text-[36px] sm:text-[42px] md:text-[54px] gold-gradient-text shimmer drop-shadow-sm leading-[1.6] px-2 text-center">
                        Erajh Alahakoon
                      </span>
                    </div>

                    {/* Date & Venue */}
                    <div className="flex items-center gap-2 sm:gap-3 text-umber/70 w-full mt-2">
                      <div className="h-px flex-1 bg-sand/45" />
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-sage font-bold">SEPTEMBER · SUNDAY</span>
                        <span className="serif text-[28px] sm:text-[32px] md:text-4xl text-white font-medium leading-none">27</span>
                        <span className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-sage font-bold">11:30 AM ONWARDS</span>
                      </div>
                      <div className="h-px flex-1 bg-sand/45" />
                    </div>

                    {/* Bottom divider */}
                    <div className="flex items-center gap-3 w-full max-w-[240px]">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-taupe/55" />
                      <svg viewBox="0 0 16 16" className="w-3 h-3 opacity-40 text-sage" fill="currentColor">
                        <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" />
                      </svg>
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-taupe/55" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Front flaps overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-[64%] sm:h-[66%] md:h-[68%] z-30 rounded-b-[2.5rem] overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-umber via-taupe/40 to-umber/80" style={{ clipPath: 'polygon(0 0, 50% 55%, 0 100%)' }}>
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/6 to-transparent" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-bl from-umber via-taupe/40 to-umber/80" style={{ clipPath: 'polygon(100% 0, 50% 55%, 100% 100%)' }}>
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="absolute inset-0 bg-gradient-to-bl from-white/6 to-transparent" />
                </div>
                <div className="absolute inset-0 bg-umber/25" style={{ clipPath: 'polygon(45% 50%, 50% 55%, 55% 50%, 50% 48%)' }} />
                <div className="absolute top-0 left-0 right-0 h-7 bg-gradient-to-b from-umber/25 to-transparent" />
              </div>
            </motion.div>
          ) : (
            <div className="w-full max-w-3xl relative h-[340px] sm:h-[380px] md:h-[460px]" />
          )}
        </div>

        {/* ── Cards List ── */}
        <div className="grid grid-cols-1 max-w-4xl mx-auto gap-6 md:gap-10 relative">

          {/* RSVP card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full h-full"
          >
            <RSVPCard />
          </motion.div>

          {/* Venue card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full h-full"
          >
            <div className="w-full h-[350px] md:h-[400px] lg:h-[400px] rounded-[2rem] overflow-hidden shadow-2xl border border-sage/20">
              <div className="w-full h-full relative group">
                <img
                  src="/WhatsApp Image 2026-07-18 at 02.13.22.jpeg"
                  alt="Hotel"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                <div className="absolute top-2 right-2 md:top-10 md:right-10 bg-sand/60 backdrop-blur-md p-3 md:p-8 border border-white/10 rounded-2xl group-hover:bg-sand/80 transition-all duration-700 shadow-xl">
                  <p className="serif text-[7px] md:text-xs uppercase tracking-[0.4em] text-sage/80 mb-1.5 flex items-center gap-2">
                    <span className="w-3 md:w-4 h-px bg-sage/30" />
                    The Location
                  </p>
                  <h3 className="serif text-lg md:text-5xl text-sage leading-tight drop-shadow-sm font-medium">
                    Kanaayan<br />Banquet Hall
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open('https://maps.app.goo.gl/CUqGhS89Vn2hLYDP8', '_blank')}
                    className="mt-2 md:mt-5 px-3 md:px-7 py-1.5 md:py-3 gold-gradient-bg shimmer text-paper rounded-full text-[7px] md:text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                  >
                    View Map
                  </motion.button>
                </div>
                <div className="absolute bottom-3 left-3 md:bottom-10 md:left-10 text-sage flex items-center gap-1.5 md:gap-3 bg-sand/60 backdrop-blur-md px-2 md:px-4 py-1.5 md:py-2 rounded-full border border-white/10 shadow-lg">
                  <MapPin className="text-sage animate-bounce" size={14} />
                  <p className="serif text-[8px] md:text-sm tracking-[0.2em] font-bold uppercase">Kanaayan Banquet Hall</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Footer ── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={showContent ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.5, delay: 2 }}
          className="text-center pt-12 pb-12 space-y-6"
        >
          <div className="flex items-center justify-center gap-6 text-sage/40">
            <div className="h-px w-16 bg-current" />
            <span className="text-xs uppercase tracking-[0.6em] font-medium">Est. 2026</span>
            <div className="h-px w-16 bg-current" />
          </div>
          <p className="serif italic text-stone-400 text-xl max-w-lg mx-auto leading-relaxed">
            "Shhh... It's a surprise! Let's keep this celebration a secret from Erajh!"
          </p>
          <p className="serif text-sage/60 text-sm italic">We can't wait to celebrate with you</p>
        </motion.footer>
      </motion.main>
    </div>
  );
}
