/**
 * Job Market Trends Component
 * Displays in-demand careers, salary ranges, and hot skills heatmap
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Flame, BarChart2 } from 'lucide-react';

const jobTrends = [
  { career: 'ML Engineer',         demand: 95, salary: '$90K – $140K', growth: '+22%', color: 'from-purple-500 to-pink-500' },
  { career: 'Data Analyst',        demand: 92, salary: '$65K – $95K',  growth: '+18%', color: 'from-cyan-500 to-blue-500' },
  { career: 'Backend Developer',   demand: 88, salary: '$75K – $120K', growth: '+17%', color: 'from-green-500 to-teal-500' },
  { career: 'Frontend Developer',  demand: 85, salary: '$70K – $110K', growth: '+15%', color: 'from-yellow-500 to-orange-500' },
  { career: 'Product Manager',     demand: 82, salary: '$85K – $130K', growth: '+14%', color: 'from-blue-500 to-indigo-500' },
  { career: 'Business Analyst',    demand: 78, salary: '$60K – $90K',  growth: '+12%', color: 'from-pink-500 to-rose-500' },
  { career: 'QA Tester',           demand: 70, salary: '$55K – $80K',  growth: '+8%',  color: 'from-gray-400 to-gray-500' },
];

const hotSkills = [
  { skill: 'Machine Learning', industries: ['AI/ML', 'Data', 'Research'], heat: 95 },
  { skill: 'Python',           industries: ['Data', 'AI/ML', 'Backend'], heat: 93 },
  { skill: 'JavaScript',       industries: ['Frontend', 'Backend', 'Web'], heat: 90 },
  { skill: 'SQL',              industries: ['Data', 'Business', 'Backend'], heat: 87 },
  { skill: 'React',            industries: ['Frontend', 'Web'], heat: 85 },
  { skill: 'Docker/K8s',       industries: ['Backend', 'DevOps'], heat: 82 },
  { skill: 'Power BI',         industries: ['Data', 'Business'], heat: 76 },
  { skill: 'Communication',    industries: ['Business', 'Product', 'Sales'], heat: 72 },
];

const getHeatColor = (heat) => {
  if (heat >= 90) return 'bg-red-500/80 text-red-100 border-red-400/50';
  if (heat >= 80) return 'bg-orange-500/70 text-orange-100 border-orange-400/50';
  if (heat >= 70) return 'bg-yellow-500/60 text-yellow-100 border-yellow-400/50';
  return 'bg-green-500/50 text-green-100 border-green-400/50';
};

const JobMarketTrends = ({ highlightCareer }) => {
  const [activeTab, setActiveTab] = useState('demand');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="mt-8"
    >
      {/* Section Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Job Market Trends</h2>
          <p className="text-gray-400 text-sm">Live demand data · Updated April 2026</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-2 mb-6">
        {[
          { id: 'demand', label: 'Demand & Salary', icon: DollarSign },
          { id: 'skills',  label: 'Hot Skills',      icon: Flame },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === id
                ? 'bg-primary-500/30 text-primary-300 border border-primary-500/50'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Demand & Salary Tab */}
      {activeTab === 'demand' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6 space-y-4"
        >
          {jobTrends.map((item, index) => (
            <motion.div
              key={item.career}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.07 }}
              className={`group rounded-lg px-2 py-1 -mx-2 transition-colors ${item.career === highlightCareer ? 'bg-primary-500/10 ring-1 ring-primary-500/30' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium text-sm ${item.career === highlightCareer ? 'text-primary-300' : 'text-white'}`}>
                  {item.career}{item.career === highlightCareer && <span className="ml-2 text-xs text-primary-400 font-normal">← your match</span>}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 text-xs">{item.salary}</span>
                  <span className="text-green-400 text-xs font-semibold">{item.growth}</span>
                  <span className="text-primary-300 text-xs font-bold w-8 text-right">{item.demand}%</span>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.demand}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.07, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                />
              </div>
            </motion.div>
          ))}

          <p className="text-gray-500 text-xs pt-2 border-t border-white/5">
            * Demand score based on job postings across LinkedIn, Indeed, and Glassdoor (mock data for demo)
          </p>
        </motion.div>
      )}

      {/* Hot Skills Heatmap Tab */}
      {activeTab === 'skills' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-white font-semibold">Skills Heatmap by Industry</span>
          </div>

          <div className="space-y-3">
            {hotSkills.map((item, index) => (
              <motion.div
                key={item.skill}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                className="flex items-start space-x-3"
              >
                {/* Skill name + heat badge */}
                <div className="flex items-center space-x-2 w-40 flex-shrink-0">
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${getHeatColor(item.heat)}`}>
                    {item.heat}°
                  </span>
                  <span className="text-white text-sm font-medium truncate">{item.skill}</span>
                </div>
                {/* Industry tags */}
                <div className="flex flex-wrap gap-1">
                  {item.industries.map((ind) => (
                    <span
                      key={ind}
                      className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Heat Legend */}
          <div className="flex items-center space-x-4 mt-5 pt-4 border-t border-white/5">
            <span className="text-gray-500 text-xs">Heat scale:</span>
            {[
              { label: '90+', cls: 'bg-red-500/80 text-red-100' },
              { label: '80+', cls: 'bg-orange-500/70 text-orange-100' },
              { label: '70+', cls: 'bg-yellow-500/60 text-yellow-100' },
              { label: '<70', cls: 'bg-green-500/50 text-green-100' },
            ].map(({ label, cls }) => (
              <span key={label} className={`text-xs px-2 py-0.5 rounded font-bold ${cls}`}>
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JobMarketTrends;
