import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';

const ORBIT_STEPS = [
  {
    title: 'Profile Signal',
    label: '01',
    accent: '#c0c1ff',
    copy: 'Your goals, strengths, education, and interests become a clean intelligence map.',
  },
  {
    title: 'Market Pulse',
    label: '02',
    accent: '#89ceff',
    copy: 'Skillence compares your direction with current role demand and skill movement.',
  },
  {
    title: 'Gap Engine',
    label: '03',
    accent: '#ddb7ff',
    copy: 'Missing skills are ranked by urgency, impact, and shortest path to proof.',
  },
  {
    title: 'Action Path',
    label: '04',
    accent: '#72f2b4',
    copy: 'Your roadmap becomes a guided sequence of resumes, practice, and milestones.',
  },
];

const OrbitStep = ({ step, index, progress }) => {
  const start = 0.12 + index * 0.17;
  const opacity = useTransform(progress, [start - 0.08, start, start + 0.14], [0.42, 1, 0.58]);
  const x = useTransform(progress, [start - 0.08, start, start + 0.14], [42, 0, -12]);
  const scale = useTransform(progress, [start - 0.08, start, start + 0.14], [0.96, 1, 0.98]);

  return (
    <motion.div
      style={{ opacity, x, scale }}
      className="scroll-orbit-step glass-panel rounded-2xl p-4 md:p-5 border border-white/10"
    >
      <div className="flex items-start gap-4">
        <div
          className="h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center font-mono text-[12px] border"
          style={{
            color: step.accent,
            borderColor: `${step.accent}55`,
            background: `${step.accent}12`,
            boxShadow: `0 0 24px ${step.accent}18`,
          }}
        >
          {step.label}
        </div>
        <div>
          <h3 className="text-on-surface font-semibold text-[16px] md:text-[18px]">{step.title}</h3>
          <p className="text-on-surface-variant text-[12px] md:text-[13px] leading-relaxed mt-1">
            {step.copy}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const ScrollOrbitExperience = () => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const headlineY = useTransform(scrollYProgress, [0, 1], [-54, 54]);
  const eyebrowOpacity = useTransform(scrollYProgress, [0, 0.18, 0.86, 1], [0, 1, 1, 0]);

  useEffect(() => {
    return scrollYProgress.on('change', (value) => {
      progressRef.current = value;
    });
  }, [scrollYProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return undefined;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6.1);

    const root = new THREE.Group();
    scene.add(root);

    scene.add(new THREE.AmbientLight(0x7d84ff, 0.7));
    const keyLight = new THREE.PointLight(0x89ceff, 18, 14);
    keyLight.position.set(2.6, 2.2, 3.5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xff7ad9, 10, 12);
    rimLight.position.set(-3.4, -2.1, 2.4);
    scene.add(rimLight);

    const coreGeometry = new THREE.IcosahedronGeometry(0.82, 3);
    const core = new THREE.Mesh(
      coreGeometry,
      new THREE.MeshPhysicalMaterial({
        color: 0x121528,
        emissive: 0x313a96,
        emissiveIntensity: 0.52,
        metalness: 0.32,
        roughness: 0.24,
        transparent: true,
        opacity: 0.72,
      })
    );
    root.add(core);

    const wire = new THREE.Mesh(
      coreGeometry.clone(),
      new THREE.MeshBasicMaterial({
        color: 0xc0c1ff,
        wireframe: true,
        transparent: true,
        opacity: 0.34,
      })
    );
    root.add(wire);

    const ringMaterials = [0xc0c1ff, 0x89ceff, 0xddb7ff].map((color) =>
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.34 })
    );
    const rings = [1.45, 2.05, 2.68].map((radius, index) => {
      const points = [];
      for (let i = 0; i <= 160; i += 1) {
        const angle = (i / 160) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
      }
      const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), ringMaterials[index]);
      ring.rotation.set(index * 0.62, index * 0.38, index * 0.2);
      root.add(ring);
      return ring;
    });

    const nodeGeometry = new THREE.SphereGeometry(0.06, 20, 12);
    const nodePalette = [0xc0c1ff, 0x89ceff, 0xddb7ff, 0x72f2b4, 0xffd166];
    const nodes = Array.from({ length: 14 }, (_, index) => {
      const angle = (index / 14) * Math.PI * 2;
      const radius = 1.52 + (index % 4) * 0.28;
      const y = Math.sin(index * 1.21) * 0.7;
      const node = new THREE.Mesh(
        nodeGeometry,
        new THREE.MeshBasicMaterial({
          color: nodePalette[index % nodePalette.length],
          transparent: true,
          opacity: 0.92,
        })
      );
      node.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      root.add(node);
      return node;
    });

    const linePositions = [];
    nodes.forEach((node, index) => {
      const next = nodes[(index + 3) % nodes.length];
      linePositions.push(
        node.position.x,
        node.position.y,
        node.position.z,
        next.position.x,
        next.position.y,
        next.position.z
      );
    });
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const networkLines = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({ color: 0x89ceff, transparent: true, opacity: 0.16 })
    );
    root.add(networkLines);

    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = [];
    for (let i = 0; i < 620; i += 1) {
      const radius = 2.8 + Math.random() * 5.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x9adfff,
        size: 0.015,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
      })
    );
    scene.add(particles);

    const resize = () => {
      const rect = section.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(Math.min(window.innerHeight, rect.height)));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const handlePointerMove = (event) => {
      const rect = section.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const handlePointerLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };

    let frameId = 0;
    const animate = (timeMs) => {
      const time = timeMs * 0.001;
      const progress = progressRef.current;
      const pointer = pointerRef.current;
      const motionScale = shouldReduceMotion ? 0.28 : 1;

      root.rotation.y = time * 0.14 * motionScale + progress * 2.45 + pointer.x * 0.16;
      root.rotation.x = -0.18 + Math.sin(time * 0.38) * 0.08 * motionScale + (progress - 0.5) * 0.5 + pointer.y * 0.12;
      core.scale.setScalar(1 + Math.sin(time * 1.7) * 0.035 * motionScale + progress * 0.12);
      wire.rotation.y = -time * 0.22 * motionScale;
      wire.rotation.z = progress * 1.4;
      rings.forEach((ring, index) => {
        ring.rotation.z = time * (0.08 + index * 0.04) * motionScale + progress * (index % 2 ? -1.7 : 1.7);
      });
      nodes.forEach((node, index) => {
        node.scale.setScalar(1 + Math.sin(time * 1.8 + index) * 0.22 * motionScale);
      });
      particles.rotation.y = -time * 0.025 * motionScale + progress * 0.5;
      camera.position.x = pointer.x * 0.24;
      camera.position.y = pointer.y * 0.16;
      camera.position.z = 6.1 - progress * 1.1;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    section.addEventListener('pointermove', handlePointerMove);
    section.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', resize);
    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', resize);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [shouldReduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[165vh] overflow-hidden border-y border-white/5 bg-[#050507]"
      aria-label="Career intelligence scroll animation"
    >
      <div className="sticky top-20 h-[calc(100vh-5rem)] min-h-[680px] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          data-testid="career-orbit-canvas"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_40%,rgba(137,206,255,0.16),transparent_34%),radial-gradient(circle_at_18%_68%,rgba(221,183,255,0.11),transparent_32%),linear-gradient(90deg,rgba(5,5,7,0.96)_0%,rgba(5,5,7,0.56)_46%,rgba(5,5,7,0.82)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0a0a0a] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1200px] flex-col justify-center gap-8 px-6 py-10 lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12">
          <motion.div style={{ y: headlineY }} className="max-w-xl">
            <motion.p
              style={{ opacity: eyebrowOpacity }}
              className="font-mono text-[11px] font-bold uppercase text-tertiary mb-3"
            >
              Scroll Intelligence Layer
            </motion.p>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-on-surface">
              Watch your career map assemble in motion.
            </h2>
            <p className="mt-4 text-[14px] md:text-[15px] leading-relaxed text-on-surface-variant">
              As you move through the page, the orbit shifts from raw signals to ranked actions, giving the product a more cinematic career-intelligence flow.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-[11px] font-mono text-on-surface-variant">
              {['3D graph', 'Live scroll depth', 'Skill nodes', 'Roadmap pulse'].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="grid w-full gap-3 justify-self-end lg:max-w-[470px]">
            {ORBIT_STEPS.map((step, index) => (
              <OrbitStep key={step.title} step={step} index={index} progress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollOrbitExperience;
