import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAI } from '../services/api';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "System Initialized. I am your AI Career Copilot. I can synthesize career path forecasts, analyze skill gaps, and audit resume templates. How shall we coordinate today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const predefinedPrompts = [
    { label: 'Salary Strategy', query: 'How should I negotiate a salary package for a Senior Developer position?' },
    { label: 'Career Switch Pivot', query: 'What is the most efficient transition path from QA Analyst to Product Manager?' },
    { label: 'Competency Delta', query: 'What skills am I missing to transition into Machine Learning Engineering?' },
    { label: 'Resume ATS Tips', query: 'How can I optimize my CV to score higher on corporate ATS screening filters?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customMessage) => {
    const textToSend = (customMessage || inputMessage).trim();
    if (!textToSend || loading) return;

    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const response = await chatWithAI(textToSend, conversationHistory);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: response.reply || response.message || 'Error compiling response. Please retry.' 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: error.detail || error.message || "Connection timeout. Please ensure the backend is running." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-[1200px] mx-auto w-full flex flex-col gap-8 text-[#e5e2e1] h-[calc(100vh-100px)]">
      {/* Background radial glows */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="bg-glow-blob w-[800px] h-[800px] bg-primary/10 top-[-200px] left-[50%] -translate-x-1/2"></div>
      </div>

      <div className="flex flex-col items-center text-center gap-2 shrink-0">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="relative w-2 h-2 rounded-full bg-primary flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full bg-primary ai-indicator-ring"></div>
          </div>
          <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest font-bold">Copilot Active</span>
        </div>
        <h1 className="text-[36px] md:text-[44px] font-black tracking-tight leading-tight gradient-text">
          AI Career Copilot
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1 overflow-hidden">
        
        {/* Left column: Quick prompts templates */}
        <div className="lg:col-span-4 flex flex-col gap-4 shrink-0">
          <div className="glass-card rounded-[28px] p-6 flex flex-col gap-4">
            <h3 className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest border-b border-white/10 pb-3">Prompt Templates</h3>
            <div className="flex flex-col gap-3">
              {predefinedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  className="w-full text-left p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/20 transition-all font-sans text-xs text-on-surface leading-relaxed group"
                >
                  <div className="font-semibold text-primary mb-1 group-hover:underline">{p.label}</div>
                  <div className="text-on-surface-variant text-[11px] line-clamp-2">{p.query}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Chat workspace */}
        <div className="lg:col-span-8 glass-card rounded-[28px] flex flex-col overflow-hidden flex-1 relative">
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[500px]">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-[85%] ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    message.role === 'user' 
                      ? 'bg-primary/20 border-primary/40 text-primary' 
                      : 'bg-white/5 border-white/10 text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {message.role === 'user' ? 'person' : 'graphic_eq'}
                    </span>
                  </div>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-primary/20 border border-primary/20 text-on-surface'
                      : 'bg-surface-container/60 border border-white/10 text-on-surface-variant'
                  }`}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  </div>
                  <div className="bg-surface-container/60 border border-white/10 rounded-2xl px-4 py-3 text-xs font-mono text-on-surface-variant">
                    Synthesizing reply parameters...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-white/10 bg-surface-container-low/40">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about careers, skill matrices, or resume gaps..."
                className="flex-1 bg-surface-container/40 border border-white/10 rounded-xl px-4 py-3.5 font-sans text-sm text-on-surface placeholder:text-on-surface-variant/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !inputMessage.trim()}
                className="p-3.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container disabled:opacity-40 flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
            <div className="text-[10px] text-on-surface-variant/40 mt-3 text-center font-mono uppercase tracking-wider">
              Press Enter to send signal • AI Copilot responds dynamically
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ChatbotPage;
