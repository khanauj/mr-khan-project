import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TAGS = [
  { label: 'React',          color: '#61DAFB' },
  { label: 'Python',         color: '#F9DC3E' },
  { label: 'Node.js',        color: '#68A063' },
  { label: 'TypeScript',     color: '#4C8CB4' },
  { label: 'Docker',         color: '#2496ED' },
  { label: 'AWS',            color: '#FF9900' },
  { label: 'Machine Learning', color: '#FF6B6B' },
  { label: 'FastAPI',        color: '#00C7B7' },
  { label: 'PostgreSQL',     color: '#4169E1' },
  { label: 'Git',            color: '#F05032' },
  { label: 'MongoDB',        color: '#47A248' },
  { label: 'JavaScript',     color: '#F7DF1E' },
  { label: 'TensorFlow',     color: '#FF6F00' },
  { label: 'CSS3',           color: '#1572B6' },
  { label: 'GraphQL',        color: '#E10098' },
  { label: 'Redis',          color: '#DC382D' },
  { label: 'Kubernetes',     color: '#326CE5' },
  { label: 'Linux',          color: '#FCC624' },
];

const CODE_LINES = [
  { text: 'import { Career } from "skillence"', color: '#a78bfa' },
  { text: 'const you = profile.analyze()',       color: '#67e8f9' },
  { text: 'path = AI.predict(skills, goals)',    color: '#34d399' },
  { text: '→ role: "Senior Dev"  94.7% ✓',      color: '#fbbf24' },
  { text: 'interview.start({ level: "pro" })',   color: '#60a5fa' },
  { text: '// Your future starts here ✨',       color: '#4a5568' },
];

// [x, y] pixel offsets from the scene center
const TAG_POSITIONS = [
  [-250, -105], [-230,  10], [-255, 105], [-215, 200],
  [ 215, -115], [ 240,  10], [ 220, 110], [ 240, 205],
  [  -85, -190], [  15, -215], [ 115, -185], [ 200, -180],
  [  -55,  250], [  95,  240], [-175,  225], [ 175,  230],
  [ -270,  125], [ 275,  125],
];

const LaptopScene = () => {
  const [lidOpen,      setLidOpen]      = useState(false);
  const [screenOn,     setScreenOn]     = useState(false);
  const [showTags,     setShowTags]     = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setLidOpen(true),  700);
    const t2 = setTimeout(() => setScreenOn(true), 2000);
    const t3 = setTimeout(() => setShowTags(true), 2100);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!screenOn) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= CODE_LINES.length) clearInterval(iv);
    }, 310);
    return () => clearInterval(iv);
  }, [screenOn]);

  return (
    <div
      className="relative w-full flex items-center justify-center overflow-hidden select-none"
      style={{ height: 520 }}
    >
      {/* ── Ambient radial glow behind laptop ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 420, height: 420,
          background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
          filter: 'blur(48px)',
          borderRadius: '50%',
        }}
      />

      {/* ── Floating Tech / Skill Tags ── */}
      {showTags && TAGS.map((tag, i) => {
        const [tx, ty] = TAG_POSITIONS[i % TAG_POSITIONS.length];
        return (
          <div
            key={tag.label}
            className="absolute pointer-events-none"
            style={{
              left: `calc(50% + ${tx}px)`,
              top:  `calc(50% + ${ty}px)`,
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
            }}
          >
            {/* pop-in */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: i * 0.09,
                type: 'spring',
                stiffness: 280,
                damping: 22,
              }}
            >
              {/* gentle float loop */}
              <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{
                  delay:    i * 0.09 + 0.55,
                  duration: 2.4 + (i % 5) * 0.35,
                  repeat:   Infinity,
                  ease:     'easeInOut',
                }}
              >
                <span
                  className="inline-block text-[11px] font-bold px-3 py-1.5 rounded-full border whitespace-nowrap"
                  style={{
                    color:           tag.color,
                    borderColor:     `${tag.color}55`,
                    backgroundColor: `${tag.color}15`,
                    boxShadow:       `0 0 12px ${tag.color}22`,
                    letterSpacing:   '0.02em',
                  }}
                >
                  {tag.label}
                </span>
              </motion.div>
            </motion.div>
          </div>
        );
      })}

      {/* ──────────────── 3-D Laptop ──────────────── */}
      <div style={{ perspective: '1000px', perspectiveOrigin: '50% 40%', zIndex: 10 }}>
        <div
          style={{
            transform: 'rotateX(5deg) rotateY(-13deg)',
            transformStyle: 'preserve-3d',
            position: 'relative',
            width: 310,
          }}
        >

          {/* ── Lid / Screen ── */}
          <motion.div
            style={{
              width: 310,
              height: 196,
              borderRadius: '12px 12px 3px 3px',
              border: '2.5px solid #1e2235',
              borderBottom: '1px solid #282d42',
              transformOrigin: 'bottom center',
              transformStyle: 'preserve-3d',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #050709, #0b0e1a)',
              boxShadow: screenOn
                ? '0 0 28px rgba(6,182,212,0.32), 0 0 60px rgba(6,182,212,0.12)'
                : 'none',
              transition: 'box-shadow 0.8s',
            }}
            initial={{ rotateX: 84 }}
            animate={{ rotateX: lidOpen ? -7 : 84 }}
            transition={{ duration: 1.6, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* camera dot */}
            <div
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#151828',
                position: 'absolute', top: 7, left: '50%',
                transform: 'translateX(-50%)',
                boxShadow: screenOn ? '0 0 6px rgba(6,182,212,0.7)' : 'none',
                transition: 'box-shadow 0.6s',
                zIndex: 5,
              }}
            />

            {/* terminal window */}
            <div style={{ padding: '18px 10px 8px', height: '100%', boxSizing: 'border-box' }}>
              <div
                style={{
                  background: '#020407',
                  borderRadius: 7,
                  padding: '8px 10px',
                  height: '100%',
                  fontFamily: '"Fira Code","Cascadia Code",Consolas,monospace',
                  fontSize: '9px',
                  lineHeight: 1.8,
                  overflow: 'hidden',
                  border: '1px solid #111624',
                  boxSizing: 'border-box',
                }}
              >
                {/* macOS traffic lights */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  {['#ff5f57', '#ffbd2e', '#28ca41'].map(c => (
                    <div key={c} style={{ width: 7, height: 7, borderRadius: '50%', background: c, flexShrink: 0 }} />
                  ))}
                  <span style={{ color: '#252d45', fontSize: 7, marginLeft: 6 }}>
                    skillence — terminal
                  </span>
                </div>

                {/* shell prompt */}
                <div style={{ color: '#2a3858', marginBottom: 6, fontSize: 8 }}>
                  $ python -m skillence.predict
                </div>

                {/* typed code lines */}
                {CODE_LINES.slice(0, visibleLines).map((line, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ color: line.color, marginBottom: 2 }}
                  >
                    {line.text}
                    {idx === visibleLines - 1 && visibleLines < CODE_LINES.length && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.55, repeat: Infinity }}
                        style={{ color: '#06b6d4', marginLeft: 2 }}
                      >
                        ▋
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* screen glow overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: screenOn ? 1 : 0 }}
              transition={{ duration: 0.9 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 50% 40%, rgba(6,182,212,0.11) 0%, transparent 75%)',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            />
          </motion.div>

          {/* ── Keyboard Base ── */}
          <div
            style={{
              width: 310,
              background: 'linear-gradient(175deg, #0e1018, #090b11)',
              borderRadius: '0 0 10px 10px',
              border: '2.5px solid #1e2235',
              borderTop: '1px solid #282d42',
              padding: '7px 18px 8px',
              boxSizing: 'border-box',
            }}
          >
            {/* key rows */}
            {[27, 28, 27, 25].map((count, row) => (
              <div key={row} style={{ display: 'flex', gap: 2, marginBottom: row < 3 ? 3 : 0 }}>
                {[...Array(count)].map((_, k) => (
                  <div
                    key={k}
                    style={{
                      flex: 1,
                      height: row === 0 ? 2.5 : 4,
                      background: '#131524',
                      borderRadius: 1.5,
                      border: '0.5px solid #1c2035',
                    }}
                  />
                ))}
              </div>
            ))}

            {/* spacebar row */}
            <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
              {[1, 1, 1, 4, 1, 1, 1, 1].map((flex, k) => (
                <div
                  key={k}
                  style={{
                    flex,
                    height: 4,
                    background: flex === 4 ? '#1a1d2e' : '#131524',
                    borderRadius: 1.5,
                    border: '0.5px solid #1c2035',
                  }}
                />
              ))}
            </div>

            {/* trackpad */}
            <div
              style={{
                width: 72, height: 10,
                background: '#0c0e18',
                border: '1px solid #1e2235',
                borderRadius: 5,
                margin: '6px auto 0',
              }}
            />
          </div>

          {/* bottom shadow strip */}
          <div
            style={{
              width: 306, height: 5, marginLeft: 2,
              background: '#06070a',
              borderRadius: '0 0 10px 10px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.95), 0 4px 10px rgba(0,0,0,0.7)',
            }}
          />
        </div>
      </div>

      {/* ── Floor glow (screen reflection) ── */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: screenOn ? 0.85 : 0, scaleX: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{
          position: 'absolute',
          bottom: 90,
          width: 230,
          height: 16,
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.55) 0%, transparent 65%)',
          filter: 'blur(10px)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
    </div>
  );
};

export default LaptopScene;
