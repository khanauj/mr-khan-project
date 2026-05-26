import { motion } from 'framer-motion';
import { Linkedin, Mail, Code, Palette, Cpu, Sparkles, Star, Target, Info } from 'lucide-react';

const About = () => {
  const developers = [
    {
      name: 'AUJ KHAN',
      role: 'ML Engineer + Backend',
      description: 'Trains machine learning models, engineers database pipelines, and designs backend FastAPI services.',
      quote: 'Building intelligent systems that transform career guidance with AI.',
      email: 'khanauj60@gmail.com',
      linkedin: 'https://www.linkedin.com/in/auj-khan-b423b4198/',
      icon: Cpu,
      accent: 'primary',
      specialties: ['Machine Learning', 'APIs', 'Career Intelligence'],
      techStack: ['Python', 'FastAPI', 'SQL', 'TensorFlow']
    },
    {
      name: 'WAZID ANSARI',
      role: 'Full-Stack + Integration',
      description: 'Maintains system-wide components integration, develops API pathways, and oversees robust container builds.',
      quote: 'Engineering robust pipelines and seamless API integrations to scale intelligence.',
      email: 'wazida471@gmail.com',
      linkedin: 'https://www.linkedin.com/in/wazid-ansari?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      icon: Code,
      accent: 'secondary',
      specialties: ['Full-Stack Dev', 'System Integration', 'API Pipelines'],
      techStack: ['Node.js', 'React', 'MongoDB', 'Docker']
    },
    {
      name: 'SUHAIB ASHRAF',
      role: 'Frontend + Design',
      description: 'Directs user interface blueprints, crafts glassmorphism tokens, and oversees visual brand aesthetics.',
      quote: 'Designing immersive, accessible interface vectors that represent user potential.',
      email: 'ashrafsuhaib674@gmail.com',
      linkedin: 'https://www.linkedin.com/in/suhaib-ashraf01/',
      icon: Palette,
      accent: 'tertiary',
      specialties: ['UX Research', 'Frontend Systems', 'Product Design'],
      techStack: ['React', 'Figma', 'Tailwind', 'CSS']
    }
  ];

  return (
    <div className="min-h-screen text-[#e5e2e1] overflow-x-hidden pt-20">
      {/* Ambient background glowing circles */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="bg-glow-blob w-[800px] h-[800px] bg-primary/10 top-[-250px] right-[-250px]"></div>
        <div className="bg-glow-blob w-[700px] h-[700px] bg-secondary/5 bottom-[-150px] left-[-150px]" style={{ animationDelay: '-5s' }}></div>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 py-12">
        
        {/* Header Hero Section */}
        <section className="relative pt-20 pb-16 text-center max-w-4xl mx-auto overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-panel mb-6 border-beam"
          >
            <span className="material-symbols-outlined text-3xl text-primary animate-pulse">neurology</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[40px] md:text-[64px] font-black tracking-tight leading-tight gradient-text"
          >
            The Minds Behind <span className="text-gradient">Skillence</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-sans text-[16px] md:text-[18px] text-on-surface-variant max-w-2xl mx-auto mt-4 leading-relaxed"
          >
            We build AI-powered career intelligence networks that calibrate profile readiness, close critical skill gaps, and accelerate professional growth vectors.
          </motion.p>
        </section>

        {/* Developers Grid Section */}
        <section className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {developers.map((dev, index) => {
              const DeveloperIcon = dev.icon;
              
              // Color mapping definitions based on accent tokens
              const accentColorClass = 
                dev.accent === 'primary' ? 'text-primary' : 
                dev.accent === 'secondary' ? 'text-secondary' : 'text-tertiary';

              const accentBorderClass = 
                dev.accent === 'primary' ? 'border-primary/20' : 
                dev.accent === 'secondary' ? 'border-secondary/20' : 'border-tertiary/20';

              const accentBgClass = 
                dev.accent === 'primary' ? 'bg-primary/5' : 
                dev.accent === 'secondary' ? 'bg-secondary/5' : 'bg-tertiary/5';

              const hoverTextClass = 
                dev.accent === 'primary' ? 'group-hover:text-primary' : 
                dev.accent === 'secondary' ? 'group-hover:text-secondary' : 'group-hover:text-tertiary';

              return (
                <motion.div
                  key={dev.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.6 }}
                  className="glass-panel rounded-[24px] p-6 flex flex-col justify-between glass-panel-hover border-beam transition-all duration-500 transform hover:-translate-y-2 group"
                >
                  <div className="space-y-6">
                    {/* Header: Icon and social connects */}
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-2xl ${accentBgClass} flex items-center justify-center border ${accentBorderClass} relative overflow-hidden`}>
                        <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent`} />
                        <DeveloperIcon className={`w-7 h-7 ${accentColorClass}`} />
                      </div>
                      
                      <div className="flex gap-2">
                        <a 
                          href={dev.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-white transition-colors border border-white/5 hover:border-white/10"
                          title="LinkedIn Profile"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                        <a 
                          href={`mailto:${dev.email}`}
                          className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-white transition-colors border border-white/5 hover:border-white/10"
                          title="Contact Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Developer Metadata */}
                    <div>
                      <h3 className="font-sans text-[20px] font-black text-white tracking-wide">{dev.name}</h3>
                      <p className={`font-mono text-[11px] uppercase tracking-widest mt-1 font-semibold ${accentColorClass}`}>
                        {dev.role}
                      </p>
                    </div>

                    {/* Quote in blockquote style */}
                    <blockquote className={`font-sans text-[13px] text-on-surface-variant italic border-l-2 ${accentBorderClass} pl-4 py-1 leading-relaxed`}>
                      "{dev.quote}"
                    </blockquote>

                    {/* Short Description */}
                    <p className="text-xs text-on-surface-variant/80 font-sans leading-relaxed">
                      {dev.description}
                    </p>
                  </div>

                  <div className="mt-8 space-y-4 pt-4 border-t border-white/5">
                    {/* Specialties list */}
                    <div>
                      <p className="font-mono text-[9px] text-outline uppercase tracking-wider mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-1.5">
                        {dev.specialties.map((spec) => (
                          <span 
                            key={spec} 
                            className={`px-2 py-0.5 rounded-full font-mono text-[9px] border ${accentBgClass} ${accentColorClass} ${accentBorderClass}`}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tech Stack tags */}
                    <div>
                      <p className="font-mono text-[9px] text-outline uppercase tracking-wider mb-2">Tech Stack</p>
                      <div className="flex flex-wrap gap-1.5">
                        {dev.techStack.map((tech) => (
                          <span 
                            key={tech} 
                            className="font-mono text-[10px] text-on-surface-variant px-2.5 py-1 bg-white/5 rounded-md border border-white/5"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Why We Built Skillence Section */}
        <section className="max-w-4xl mx-auto py-16 text-center">
          <h2 className="text-[32px] font-black mb-6 tracking-tight text-white">Why We Built Skillence</h2>
          <div className="glass-panel p-8 md:p-10 rounded-[28px] relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
            
            <p className="font-sans text-[15px] md:text-[17px] text-on-surface-variant leading-relaxed relative z-10 text-center max-w-3xl mx-auto">
              Career guidance is fundamentally broken. Professionals and students alike navigate transition decisions blind—unsure of skill requirements, CV tracking indices, or performance markers. We engineered Skillence to calibrate profiles in real-time, mapping exact skill delta values so you can step confidently into high-velocity career options.
            </p>
          </div>
        </section>

        {/* Mission & Stats Section */}
        <section className="py-12 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 lg:pr-8 text-center lg:text-left space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-primary">Core Compass</span>
              </div>
              <h2 className="text-[32px] font-black leading-tight text-white">Our Mission</h2>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                Make high-fidelity, predictive career planning and interview simulations accessible to every professional on the planet.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Stat 1 */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border-t border-primary/30">
                <span className="material-symbols-outlined text-[36px] text-primary opacity-80">route</span>
                <h4 className="text-3xl font-black text-white mt-1">10k+</h4>
                <p className="font-mono text-[9px] text-outline uppercase tracking-wider">Career Maps Processed</p>
              </div>

              {/* Stat 2 */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border-t border-secondary/30">
                <span className="material-symbols-outlined text-[36px] text-secondary opacity-80">insights</span>
                <h4 className="text-3xl font-black text-white mt-1">95%</h4>
                <p className="font-mono text-[9px] text-outline uppercase tracking-wider">Prediction Confidence</p>
              </div>

              {/* Stat 3 */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border-t border-tertiary/30">
                <span className="material-symbols-outlined text-[36px] text-tertiary opacity-80">psychology</span>
                <h4 className="text-3xl font-black text-white mt-1">50+</h4>
                <p className="font-mono text-[9px] text-outline uppercase tracking-wider">Skill Vectors Calibrated</p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Contact Collaboration Box */}
        <section className="mt-12 text-center">
          <div className="glass-panel p-8 max-w-2xl mx-auto rounded-[24px] border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 pointer-events-none" />
            <h3 className="text-xl font-bold text-white mb-2">Interested in Collaborating?</h3>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
              We are actively developing new integrations for recruiters and enterprises. Reach out to discuss models, partnerships, or features.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {developers.map((dev) => (
                <a
                  key={dev.email}
                  href={`mailto:${dev.email}`}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-mono text-[10px] uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Contact {dev.name.split(' ')[0]}
                </a>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default About;
