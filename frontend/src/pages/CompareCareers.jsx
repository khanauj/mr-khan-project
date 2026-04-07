import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

  const colors = ['#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            Career Comparison Tool
          </h1>
          <p className="text-gray-400 text-lg">
            Compare 2-3 careers side by side to see which one fits your goals.
          </p>
        </motion.div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleCompare} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Career 1</label>
                <select
                  value={career1}
                  onChange={(e) => setCareer1(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  {careerOptions.map(opt => <option key={`c1-${opt}`} value={opt}>{opt}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Career 2</label>
                <select
                  value={career2}
                  onChange={(e) => setCareer2(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  {careerOptions.map(opt => <option key={`c2-${opt}`} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Career 3 (Optional)</label>
                <select
                  value={career3}
                  onChange={(e) => setCareer3(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">None</option>
                  {careerOptions.map(opt => <option key={`c3-${opt}`} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Compare Careers</span>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {comparisonData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 bg-gray-900 border border-gray-800 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6 text-center">Comparison Radar</h3>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Radar name={career1} dataKey={career1} stroke={colors[0]} fill={colors[0]} fillOpacity={0.5} />
                    <Radar name={career2} dataKey={career2} stroke={colors[1]} fill={colors[1]} fillOpacity={0.5} />
                    {career3 && (
                      <Radar name={career3} dataKey={career3} stroke={colors[2]} fill={colors[2]} fillOpacity={0.5} />
                    )}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareCareers;
