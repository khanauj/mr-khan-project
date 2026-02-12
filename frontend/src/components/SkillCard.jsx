/**
 * Skill Card Component
 * Displays skills with animations and status indicators
 */

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

const SkillCard = ({ skill, status = 'current', index = 0 }) => {
  const variants = {
    current: {
      bg: 'bg-green-500/20 border-green-500/50',
      icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
      text: 'text-green-400',
      label: 'Current Skill',
    },
    missing: {
      bg: 'bg-red-500/20 border-red-500/50',
      icon: <XCircle className="w-5 h-5 text-red-400" />,
      text: 'text-red-400',
      label: 'Missing Skill',
    },
    learning: {
      bg: 'bg-yellow-500/20 border-yellow-500/50',
      icon: <Clock className="w-5 h-5 text-yellow-400" />,
      text: 'text-yellow-400',
      label: 'In Progress',
    },
  };

  const style = variants[status] || variants.current;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`p-4 rounded-xl border ${style.bg} backdrop-blur-sm transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 + 0.2, type: 'spring', stiffness: 200 }}
          >
            {style.icon}
          </motion.div>
          <div>
            <h4 className={`font-semibold ${style.text}`}>{skill}</h4>
            <p className="text-xs text-gray-400 mt-1">{style.label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SkillCard;
