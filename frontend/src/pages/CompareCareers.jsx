import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { compareCareers } from '../services/api';

const CompareCareers = () => {
  const [career1, setCareer1] = useState('Data Analyst');
  const [career2, setCareer2] = useState('Software Engineer');
  const [career3, setCareer3] = useState('');
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const careerOptions = [
    'Data Analyst', 'Data Scientist', 'Software Engineer', 
    'Frontend Developer', 'Backend Developer', 'ML Engineer',
    'Product Manager', 'Business Analyst', 'UX/UI Designer'
  ];

  const handleCompare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const careersToCompare = [career1, career2];
    if (career3) careersToCompare.push(career3);

    try {
      const data = await compareCareers(careersToCompare);
      
      if (data && data.comparison_data) {
        const transformedData = [
          { subject: 'Demand', fullMark: 10 },
          { subject: 'Skills Needed', fullMark: 10 },
          { subject: 'Difficulty', fullMark: 10 },
          { subject: 'Salary (Relative)', fullMark: 10 }
        ];

        let maxSalary = Math.max(...data.comparison_data.map(d => d.salary));
        if (maxSalary === 0 || isNaN(maxSalary)) maxSalary = 100000;

        transformedData.forEach((item) => {
          data.comparison_data.forEach(c => {
             if (item.subject === 'Salary (Relative)') {
               item[c.career] = (c.salary / maxSalary) * 10;
             } else if (item.subject === 'Demand') {
               item[c.career] = c.demand;
             } else if (item.subject === 'Skills Needed') {
               item[c.career] = c.skills_needed;
             } else if (item.subject === 'Difficulty') {
               item[c.career] = c.difficulty;
             }
          });
        });

        setComparisonData(transformedData);
      }
      
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Harmonized palette colors from Stitch
  const colors = ['#c0c1ff', '#ddb7ff', '#89ceff'];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-[1200px] mx-auto w-full flex flex-col gap-12 text-[#e5e2e1]">
      {/* Background blobs */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="bg-glow-blob w-[800px] h-[800px] bg-primary/10 top-[-200px] left-[-100px]"></div>
        <div className="bg-glow-blob w-[600px] h-[600px] bg-tertiary/10 bottom-[-100px] right-[-100px]" style={{ animationDelay: '-4s' }}></div>
      </div>

      <div className="flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="relative w-2 h-2 rounded-full bg-primary flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full bg-primary ai-indicator-ring"></div>
          </div>
          <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest font-bold">Horizon Compare Active</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-black tracking-tight leading-tight gradient-text max-w-4xl">
          Career Comparison
        </h1>
        <p className="font-sans text-[16px] text-on-surface-variant max-w-xl leading-relaxed">
          Graph alternative career pathways side by side. Synthesize parameters including demand, difficulty, and salary relative index.
        </p>
      </div>

      <div className="glass-card rounded-[28px] p-8 relative max-w-4xl mx-auto w-full">
        <form onSubmit={handleCompare} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Select 1 */}
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider block">Career Path 1</label>
              <div className="relative">
                <select
                  value={career1}
                  onChange={(e) => setCareer1(e.target.value)}
                  className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-4 py-3 font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                >
                  {careerOptions.map(opt => <option key={`c1-${opt}`} value={opt}>{opt}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                  keyboard_arrow_down
                </span>
              </div>
            </div>

            {/* Select 2 */}
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider block">Career Path 2</label>
              <div className="relative">
                <select
                  value={career2}
                  onChange={(e) => setCareer2(e.target.value)}
                  className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-4 py-3 font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                >
                  {careerOptions.map(opt => <option key={`c2-${opt}`} value={opt}>{opt}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                  keyboard_arrow_down
                </span>
              </div>
            </div>

            {/* Select 3 (Optional) */}
            <div className="space-y-2">
              <label className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider block">Career Path 3 (Optional)</label>
              <div className="relative">
                <select
                  value={career3}
                  onChange={(e) => setCareer3(e.target.value)}
                  className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-4 py-3 font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="">None</option>
                  {careerOptions.map(opt => <option key={`c3-${opt}`} value={opt}>{opt}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                  keyboard_arrow_down
                </span>
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="ai-glow w-full py-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0 cursor-pointer animate-fade-in"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Synthesizing Horizon Comparison...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                Synthesize Comparison
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-sans text-center">
            {error}
          </div>
        )}

        <AnimatePresence>
          {comparisonData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-6"
            >
              <h3 className="text-lg font-semibold text-on-surface text-center">Comparison Radar Analysis</h3>
              
              <div className="h-[400px] w-full bg-surface-container/20 rounded-2xl border border-white/5 p-4 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#c7c4d7', fontSize: 12, fontFamily: 'monospace' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#201f1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#e5e2e1' }}
                    />
                    <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: 11 }} />
                    <Radar name={career1} dataKey={career1} stroke={colors[0]} fill={colors[0]} fillOpacity={0.4} />
                    <Radar name={career2} dataKey={career2} stroke={colors[1]} fill={colors[1]} fillOpacity={0.4} />
                    {career3 && (
                      <Radar name={career3} dataKey={career3} stroke={colors[2]} fill={colors[2]} fillOpacity={0.4} />
                    )}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!comparisonData.length && !loading && (
        <div className="max-w-2xl mx-auto w-full rounded-[28px] border border-dashed border-white/10 p-12 text-center bg-surface-container/20">
          <span className="material-symbols-outlined text-on-surface-variant/20 text-[56px] mb-4">radar</span>
          <p className="font-mono text-[11px] uppercase tracking-widest text-on-surface font-bold">Compare Careers</p>
          <p className="text-on-surface-variant text-sm mt-2 max-w-sm mx-auto leading-relaxed">
            Select 2 or 3 career path alternatives from the selectors above, and run comparison.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompareCareers;
