import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, Bell, CheckCircle, ChevronRight, Check } from 'lucide-react';

const GoalSetting = () => {
  const [goal, setGoal] = useState({
    targetRole: 'Data Analyst',
    deadline: '',
    progress: 65,
    emailNotifications: true,
    inAppReminders: true
  });
  const [isSaved, setIsSaved] = useState(false);

  // Suggested weekly tasks based on progress
  const weeklyTasks = [
    { id: 1, text: 'Complete advanced Python scripting module', completed: true },
    { id: 2, text: 'Review 5 common SQL interview questions', completed: false },
    { id: 3, text: 'Update LinkedIn profile with new skills', completed: false },
    { id: 4, text: 'Apply to at least 3 mid-level positions', completed: false }
  ];

  const handleSave = (e) => {
    e.preventDefault();
    // Simulate saving to database/localStorage
    localStorage.setItem('userGoal', JSON.stringify(goal));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('userGoal');
    if (saved) {
      try {
        setGoal(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
              <Target className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Goal Tracking
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Set your target role, track your weekly momentum, and never miss a milestone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            <form onSubmit={handleSave} className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" /> Career Goal
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Target Role</label>
                  <select
                    value={goal.targetRole}
                    onChange={(e) => setGoal({ ...goal, targetRole: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option>Data Analyst</option>
                    <option>Software Engineer</option>
                    <option>Frontend Developer</option>
                    <option>ML Engineer</option>
                    <option>Product Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Target Deadline</label>
                  <input
                    type="date"
                    value={goal.deadline}
                    onChange={(e) => setGoal({ ...goal, deadline: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-800">
                  <h3 className="text-sm font-medium text-gray-400">Notifications</h3>
                  
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${goal.emailNotifications ? 'bg-blue-500 border-blue-500' : 'border-gray-600 group-hover:border-blue-400'}`}>
                      {goal.emailNotifications && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-gray-300">Weekly Email Reports</span>
                    <input type="checkbox" className="hidden" checked={goal.emailNotifications} onChange={(e) => setGoal({...goal, emailNotifications: e.target.checked})} />
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${goal.inAppReminders ? 'bg-blue-500 border-blue-500' : 'border-gray-600 group-hover:border-blue-400'}`}>
                      {goal.inAppReminders && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-gray-300">In-App Reminders</span>
                    <input type="checkbox" className="hidden" checked={goal.inAppReminders} onChange={(e) => setGoal({...goal, inAppReminders: e.target.checked})} />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex justify-center items-center gap-2"
                >
                  {isSaved ? <CheckCircle className="w-5 h-5" /> : 'Save Goal Settings'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Progress Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Status Banner */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">You're {goal.progress}% ready for '{goal.targetRole}'!</h3>
                  <p className="text-gray-400">
                    You're on track to hit your goal by {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'your deadline'}. Keep pushing!
                  </p>
                </div>
                
                <div className="relative w-24 h-24 flex shrink-0 items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * goal.progress) / 100} className="text-blue-500 transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                    {goal.progress}%
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Action Plan */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" /> This Week's Action Plan
                </h3>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold">
                  1 of 4 Completed
                </span>
              </div>

              <div className="space-y-3">
                {weeklyTasks.map((task) => (
                  <div key={task.id} className={`flex items-start p-4 rounded-xl border transition-all ${task.completed ? 'bg-green-500/5 border-green-500/20' : 'bg-gray-800/50 border-gray-700 hover:border-gray-500 cursor-pointer'}`}>
                    <div className="mt-0.5 min-w-[24px]">
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                        {task.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-2">
                View Past Weeks <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GoalSetting;
