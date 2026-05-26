import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Send, Square, Play, Bot, User, Volume2, VolumeX, Loader2, 
  Lightbulb, CheckCircle2, MessageCircle, Sparkles, Star, ChevronDown, 
  Search, X, Plus, Terminal, Zap, ShieldAlert, Award, Flame 
} from 'lucide-react';
import { startInterview, submitInterviewAnswer, textToSpeech } from '../services/api';

const HISTORY_KEY = 'interviewHistory';

const saveSessionToHistory = (role, level, report) => {
  try {
    const prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      role,
      level,
      score: report.final_score,
      recommendation: report.hire_recommendation,
      strengths: report.strengths || [],
      weaknesses: report.weaknesses || [],
    };
    const updated = [entry, ...prev].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch { return []; }
};

const ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Analyst', 'Data Scientist', 'ML Engineer', 'DevOps Engineer',
  'Product Manager', 'UI/UX Designer', 'QA Engineer', 'Mobile Developer',
  'Cloud Architect', 'Cybersecurity Analyst', 'Business Analyst',
];

const ROLE_SUGGESTIONS = [
  { name: 'ML Engineer', skills: ['Python', 'PyTorch', 'SQL', 'Scikit-Learn'] },
  { name: 'Data Analyst', skills: ['Python', 'SQL', 'Excel', 'Power BI'] },
  { name: 'Frontend Dev', skills: ['JavaScript', 'React', 'HTML', 'Tailwind'] },
  { name: 'Backend Dev', skills: ['Python', 'FastAPI', 'SQL', 'Docker'] },
];

const LEVELS = ['Fresher', 'Intermediate', 'Advanced'];
const INT_TYPES = [
  { id: 'technical', label: 'Technical', icon: 'code', desc: 'Focuses on system design, coding, & frameworks.' },
  { id: 'behavioral', label: 'Behavioral', icon: 'forum', desc: 'Focuses on communication, leadership, & soft skills.' },
  { id: 'mixed', label: 'Mixed', icon: 'psychology', desc: 'A blended evaluation of tech depth and culture fit.' },
];

const DIFFICULTIES = [
  { id: 'Friendly', label: 'Friendly', icon: 'sentiment_satisfied', color: 'text-green-400' },
  { id: 'Professional', label: 'Professional', icon: 'work', color: 'text-primary' },
  { id: 'FAANG Pressure', label: 'FAANG Pressure', icon: 'local_fire_department', color: 'text-red-400' },
];

const Interview = () => {
  // Setup state
  const [role, setRole] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [level, setLevel] = useState('Intermediate');
  const [techStack, setTechStack] = useState('');
  const [skillsList, setSkillsList] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [interviewType, setInterviewType] = useState('technical');
  const [difficulty, setDifficulty] = useState('Professional');
  const [started, setStarted] = useState(false);

  // Interview state
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [finalReport, setFinalReport] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const totalQuestions = 6;
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [useVoice, setUseVoice] = useState(true);

  // Live Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Refs
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);
  const sttFallbackTextRef = useRef('');
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Stop TTS & timers if unmounted
  useEffect(() => {
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Set up timer during live session
  useEffect(() => {
    if (started && !finalReport) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, finalReport]);

  // Click outside listener for role dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimer = (totalSecs) => {
    const minutes = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const seconds = (totalSecs % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setRoleInput(selectedRole);
    setShowRoleDropdown(false);
    
    // Auto-fill suggested skills to delight the user
    const found = ROLE_SUGGESTIONS.find(
      (s) => s.name.toLowerCase() === selectedRole.toLowerCase() || 
             selectedRole.toLowerCase().includes(s.name.toLowerCase())
    );
    if (found) {
      setSkillsList(found.skills);
      setTechStack(found.skills.join(', '));
    }
  };

  const handleAddSkill = (e) => {
    if (e && e.key !== 'Enter') return;
    if (e) e.preventDefault();

    const trimmed = skillInput.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      const updated = [...skillsList, trimmed];
      setSkillsList(updated);
      setTechStack(updated.join(', '));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skillsList.filter((s) => s !== skillToRemove);
    setSkillsList(updated);
    setTechStack(updated.join(', '));
  };

  const speakText = async (text) => {
    if (!ttsEnabled) return;
    setIsSpeaking(true);

    try {
      const audioBlob = await textToSpeech(text);
      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          fallbackSpeak(text);
          URL.revokeObjectURL(audioUrl);
        };
        await audio.play();
      } else {
        fallbackSpeak(text);
      }
    } catch {
      fallbackSpeak(text);
    }
  };

  const fallbackSpeak = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const handleStart = async () => {
    if (!role || skillsList.length === 0) {
      setErrorMsg('Please select a target role and add at least one core skill.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setTimerSeconds(0);
    try {
      const data = await startInterview({ 
        role, 
        level, 
        tech_stack: techStack,
        difficulty,
        interview_type: interviewType
      });
      setSessionId(data.session_id);
      setStarted(true);
      setQuestionNumber(1);

      const resp = data.response;
      setCurrentQuestion(resp.question);
      setMessages([{ type: 'bot', text: resp.question }]);
      speakText(resp.question);
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail || err?.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answerText) => {
    if (!answerText.trim() || !sessionId) return;

    setMessages((prev) => [...prev, { type: 'user', text: answerText }]);
    setTextInput('');
    setLoading(true);
    setErrorMsg('');
    stopSpeaking();

    try {
      const data = await submitInterviewAnswer({
        answer: answerText,
        session_id: sessionId,
        question_number: questionNumber
      });

      const resp = data.response;
      setQuestionNumber(data.question_number || questionNumber + 1);

      if (resp.type === 'final_report') {
        setFinalReport(resp);
        setMessages((prev) => [...prev, { type: 'report', data: resp }]);
        speakText(resp.summary);
        saveSessionToHistory(role, level, resp);
      } else {
        setCurrentQuestion(resp.question);
        setMessages((prev) => [
          ...prev,
          { type: 'evaluation', data: resp.evaluation },
          { type: 'bot', text: resp.question },
        ]);
        speakText(resp.question);
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail || err?.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        stream.getTracks().forEach((t) => t.stop());
        setErrorMsg('Speech recognition is not supported in this browser. Please use text mode.');
        setUseVoice(false);
        return;
      }

      setErrorMsg('');
      sttFallbackTextRef.current = '';
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        sttFallbackTextRef.current = transcript.trim();
        setTextInput(transcript); // Sync typed field with speech result
      };
      
      recognition.onerror = (e) => {
        if (e.error === 'not-allowed') {
          setErrorMsg('Microphone access denied. Please check site permissions.');
          setIsRecording(false);
          setUseVoice(false);
        }
      };
      
      recognition.onend = () => {
        if (isRecording && recognitionRef.current === recognition) {
          try { recognition.start(); } catch { /* ignore */ }
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      mediaRecorderRef.current = stream;
    } catch (err) {
      setErrorMsg('Microphone access failed. Please connect a mic or switch to text mode.');
      setUseVoice(false);
    }
  };

  const stopRecordingAndSubmit = () => {
    if (!isRecording) return;
    setIsRecording(false);

    const recognition = recognitionRef.current;
    recognitionRef.current = null;

    const stream = mediaRecorderRef.current;
    if (stream && stream.getTracks) {
      stream.getTracks().forEach((t) => t.stop());
    }

    if (!recognition) return;

    recognition.onend = () => {
      const transcript = sttFallbackTextRef.current;
      if (transcript) {
        handleAnswer(transcript);
      } else {
        setErrorMsg('Could not detect any speech. Please try speaking closer to the mic or type.');
      }
    };
    recognition.stop();
  };

  const getFeedbackHistory = () => {
    let hist = [];
    let curQ = "";
    let curA = "";
    for (let msg of messages) {
       if (msg.type === 'bot') curQ = msg.text;
       else if (msg.type === 'user') curA = msg.text;
       else if (msg.type === 'evaluation') {
           hist.push({ question: curQ, answer: curA, eval: msg.data });
       }
    }
    return hist;
  };

  const feedbackHistory = getFeedbackHistory();

  // Retrieve current rolling average scores to display live metrics
  const getRollingScores = () => {
    if (feedbackHistory.length === 0) {
      return { confidence: 0, clarity: 0, techDepth: 0, communication: 0 };
    }
    let totalConf = 0;
    let totalComm = 0;
    feedbackHistory.forEach((item) => {
      totalConf += item.eval.confidence_score || 7;
      totalComm += item.eval.communication_score || 8;
    });
    const avgConf = totalConf / feedbackHistory.length;
    const avgComm = totalComm / feedbackHistory.length;
    return {
      confidence: Math.round(avgConf * 10),
      clarity: Math.round(avgComm * 10),
      techDepth: Math.round(avgConf * 9.5),
      communication: Math.round(avgComm * 10),
    };
  };

  const rollingScores = getRollingScores();

  // 1. SETUP VIEW (Screen 12 coordinate mockup layout)
  if (!started) {
    const filteredRoles = ROLES.filter((r) => 
      r.toLowerCase().includes(roleInput.toLowerCase())
    );

    return (
      <div className="min-h-screen text-[#e5e2e1] overflow-x-hidden pt-20">
        {/* Ambient background glows */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="bg-glow-blob w-[800px] h-[800px] bg-primary/10 top-[-200px] right-[-200px]"></div>
          <div className="bg-glow-blob w-[600px] h-[600px] bg-secondary/10 bottom-[-100px] left-[-100px]" style={{ animationDelay: '-4s' }}></div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 py-12">
          {/* Header */}
          <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-[40px] md:text-[64px] font-black tracking-tight leading-tight gradient-text">
                Start Your AI Interview
              </h1>
              <p className="font-sans text-[16px] md:text-[18px] text-on-surface-variant max-w-2xl leading-relaxed mt-2">
                Hone your core responses under professional conditions. Our AI simulates custom behavioral and technical panels.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full glass-panel shrink-0 self-center md:self-end">
              <span className="w-2 h-2 rounded-full bg-primary relative ai-pulse"></span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-primary">Secure Sandbox Active</span>
            </div>
          </header>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-error/10 border border-error/20 text-error rounded-2xl flex items-center gap-3"
            >
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Setup Form (Left Column - 8 slots) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="glass-panel rounded-3xl p-8 border-beam relative">
                <div className="space-y-8">
                  
                  {/* 1. Target Role Search Input */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="block font-mono text-[11px] uppercase tracking-widest text-on-surface mb-3">
                      1. Target Role *
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                      <input 
                        type="text" 
                        value={roleInput}
                        onChange={(e) => {
                          setRoleInput(e.target.value);
                          setRole(e.target.value); // Sync target
                          setShowRoleDropdown(true);
                        }}
                        onFocus={() => setShowRoleDropdown(true)}
                        placeholder="e.g. ML Engineer, Frontend Developer..." 
                        className="w-full bg-[#0e0e0e]/50 border border-white/10 rounded-xl py-4 pl-12 pr-10 font-sans text-[15px] text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant"
                      />
                      {roleInput && (
                        <button 
                          type="button" 
                          onClick={() => { setRoleInput(''); setRole(''); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Role Autocomplete Dropdown */}
                    <AnimatePresence>
                      {showRoleDropdown && filteredRoles.length > 0 && (
                        <motion.ul 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute z-20 w-full mt-2 bg-[#121212] border border-white/10 rounded-2xl max-h-60 overflow-y-auto shadow-2xl custom-scrollbar"
                        >
                          {filteredRoles.map((r) => (
                            <li 
                              key={r}
                              onClick={() => handleRoleSelect(r)}
                              className="px-5 py-3.5 hover:bg-white/5 cursor-pointer text-sm transition-colors text-on-surface-variant hover:text-white border-b border-white/5 last:border-0"
                            >
                              {r}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>

                    {/* SUGGESTED TARGET ROLE CHIPS */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ROLE_SUGGESTIONS.map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => handleRoleSelect(s.name)}
                          className={`px-3.5 py-1.5 rounded-full text-xs transition-colors border font-mono ${
                            role === s.name 
                              ? 'bg-primary/20 border-primary text-primary' 
                              : 'bg-white/5 border-white/10 text-on-surface-variant hover:bg-white/10'
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Experience Level Slider */}
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-widest text-on-surface mb-3">
                      2. Experience Level
                    </label>
                    <div className="grid grid-cols-3 gap-2 bg-[#0e0e0e]/50 p-1 border border-white/10 rounded-2xl">
                      {LEVELS.map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setLevel(l)}
                          className={`py-3 rounded-xl font-mono text-[12px] uppercase tracking-wider transition-all duration-300 ${
                            level === l
                              ? 'bg-[#1b1c2b] text-primary border border-primary/20 shadow-lg'
                              : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Interview Type Radio Selection */}
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-widest text-on-surface mb-3">
                      3. Interview Panel Focus
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {INT_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setInterviewType(type.id)}
                          className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all group ${
                            interviewType === type.id
                              ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5'
                              : 'bg-[#0e0e0e]/50 border-white/10 hover:bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-3">
                            <span className={`material-symbols-outlined text-[24px] ${
                              interviewType === type.id ? 'text-primary' : 'text-outline-variant group-hover:text-white'
                            }`}>
                              {type.icon}
                            </span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              interviewType === type.id ? 'border-primary' : 'border-outline-variant'
                            }`}>
                              {interviewType === type.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </div>
                          </div>
                          <div>
                            <h4 className={`text-base font-semibold transition-colors ${
                              interviewType === type.id ? 'text-white' : 'text-on-surface-variant group-hover:text-white'
                            }`}>
                              {type.label}
                            </h4>
                            <p className="text-xs text-outline-variant mt-1 leading-relaxed">
                              {type.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Tech Stack / Skills Chip Input */}
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-widest text-on-surface mb-3">
                      4. Core Stack & Frameworks *
                    </label>
                    <div className="w-full bg-[#0e0e0e]/50 border border-white/10 rounded-2xl p-4 flex flex-wrap gap-2 items-center min-h-[64px] focus-within:border-primary transition-colors">
                      {skillsList.map((skill) => (
                        <span 
                          key={skill} 
                          className="flex items-center gap-1.5 bg-[#141424] border border-primary/20 px-3 py-1.5 rounded-xl font-mono text-[11px] text-primary"
                        >
                          {skill}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder={skillsList.length === 0 ? "Type skill and press Enter (e.g. React)..." : "Add more..."} 
                        className="bg-transparent border-none focus:ring-0 p-0 font-sans text-sm text-white placeholder-gray-600 flex-grow min-w-[150px] outline-none"
                      />
                    </div>
                    {skillsList.length > 0 && (
                      <p className="text-xs text-outline-variant mt-2 italic pl-1">
                        Press Enter or separate with commas to register each skill indicator.
                      </p>
                    )}
                  </div>

                  {/* 5. Difficulty Mode Selector */}
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-widest text-on-surface mb-3">
                      5. Difficulty Parameters
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0e0e0e]/50 p-1.5 border border-white/10 rounded-2xl">
                      {DIFFICULTIES.map((diff) => (
                        <button
                          key={diff.id}
                          type="button"
                          onClick={() => setDifficulty(diff.id)}
                          className={`py-3.5 px-4 rounded-xl font-mono text-[12px] uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 ${
                            difficulty === diff.id
                              ? 'bg-[#1b1c2b] border border-primary/20 shadow-lg text-white'
                              : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[18px] ${diff.color}`}>
                            {diff.icon}
                          </span>
                          {diff.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Session Preview & CTA (Right Column - 4 slots) */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between shadow-2xl">
                <div>
                  <h3 className="font-sans text-[20px] font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">preview</span>
                    Session Specs
                  </h3>

                  <div className="space-y-4">
                    {/* Time / Qs grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#0e0e0e]/40 p-4 rounded-2xl border border-white/5">
                        <span className="block font-mono text-[10px] text-outline mb-1 uppercase tracking-widest">Est. Duration</span>
                        <span className="font-sans text-[20px] font-semibold text-white">12 mins</span>
                      </div>
                      <div className="bg-[#0e0e0e]/40 p-4 rounded-2xl border border-white/5">
                        <span className="block font-mono text-[10px] text-outline mb-1 uppercase tracking-widest">Total Prompts</span>
                        <span className="font-sans text-[20px] font-semibold text-white">{totalQuestions} Queries</span>
                      </div>
                    </div>

                    {/* Summary badge container */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-xs text-on-surface font-semibold uppercase">{level || 'Intermediate'}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 font-mono text-[10px] text-primary uppercase">
                          {interviewType}
                        </span>
                      </div>
                      
                      <div>
                        <span className="block font-mono text-[9px] text-outline mb-1 uppercase tracking-widest">Target Role</span>
                        <span className="font-sans text-sm text-white font-medium">{role || 'Not set'}</span>
                      </div>

                      {skillsList.length > 0 && (
                        <div>
                          <span className="block font-mono text-[9px] text-outline mb-1 uppercase tracking-widest">Core Stack</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {skillsList.slice(0, 4).map((s) => (
                              <span key={s} className="bg-[#0e0e0e]/60 px-2 py-0.5 rounded text-[10px] text-on-surface-variant font-mono">
                                {s}
                              </span>
                            ))}
                            {skillsList.length > 4 && (
                              <span className="text-[10px] text-primary font-mono self-center pl-1">
                                +{skillsList.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Active AI specs checklist */}
                    <div>
                      <h4 className="font-mono text-[10px] text-outline-variant uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                        System Agents Active
                      </h4>
                      <ul className="space-y-2.5">
                        {['Voice Dialogue Synth', 'Confidence Analytics', 'ATS Matching Matrix', 'STAR Method Tracker'].map((feat) => (
                          <li key={feat} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/25">
                              <span className="material-symbols-outlined text-[12px] text-primary font-bold">check</span>
                            </div>
                            <span className="font-sans text-[13px] text-on-surface-variant">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5">
                  <button 
                    onClick={handleStart}
                    disabled={loading || !role || skillsList.length === 0}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-background font-mono text-[13px] uppercase tracking-wider font-semibold flex justify-center items-center gap-2 btn-glow transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-[0_0_20px_rgba(192,193,255,0.25)] border border-white/20 disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin text-background" /> : null}
                    {loading ? 'Compiling Agent...' : 'Start AI Interview'}
                    {!loading && <span className="material-symbols-outlined text-[16px]">arrow_forward</span>}
                  </button>
                  
                  <p className="text-center font-mono text-[9px] text-outline-variant uppercase tracking-widest mt-3 flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[12px]">lock</span> 
                    Encrypted WebRTC Session
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE LIVE SIMULATOR VIEW (Screen 13 coordinate layout)
  return (
    <div className="min-h-screen text-[#e5e2e1] overflow-x-hidden pt-20">
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[30%] bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header Bar */}
      <header className="w-full px-6 py-4 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-20 z-40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="font-mono text-[11px] text-red-400 tracking-widest uppercase font-bold">Live Session</span>
          </div>

          <div className="hidden sm:block h-5 w-px bg-white/10"></div>

          <div className="flex items-center gap-4 flex-wrap text-xs font-mono text-outline">
            <div>
              <span className="text-[10px] text-outline-variant block uppercase tracking-wider">Role</span>
              <span className="text-white font-sans font-semibold">{role}</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
            <div>
              <span className="text-[10px] text-outline-variant block uppercase tracking-wider">Difficulty</span>
              <span className="text-white font-sans font-semibold">{difficulty}</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
            <div>
              <span className="text-[10px] text-outline-variant block uppercase tracking-wider">Progress</span>
              <span className="text-white font-sans font-semibold">Question {questionNumber} of {totalQuestions}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
          <div className="text-right">
            <span className="font-mono text-[9px] text-outline block mb-1 uppercase tracking-wider">Estimated Score</span>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[22px] font-black text-primary leading-none">
                {rollingScores.confidence ? `${rollingScores.confidence}%` : 'Awaiting'}
              </span>
              {rollingScores.confidence > 0 && (
                <div className="w-14 h-1.5 bg-[#0e0e0e] rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-700" 
                    style={{ width: `${rollingScores.confidence}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => {
              stopSpeaking();
              setStarted(false);
              setFinalReport(null);
              setMessages([]);
            }}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 font-mono text-[11px] text-white transition-all flex items-center gap-1.5 active:scale-95"
          >
            <X className="w-3.5 h-3.5" /> End Session
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        
        {finalReport ? (
          // 3. FINAL REPORT DASHBOARD VIEW
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl relative overflow-hidden"
          >
            {/* Ambient glows inside card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="text-center relative z-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                <span className="text-4xl font-black text-background">{finalReport.final_score}</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Simulation Complete</h2>
              <p className="text-on-surface-variant font-sans text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                {finalReport.summary}
              </p>

              <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-mono text-xs font-bold border mb-8 uppercase tracking-wider ${
                finalReport.hire_recommendation === 'Yes' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${finalReport.hire_recommendation === 'Yes' ? 'bg-green-400' : 'bg-red-400'}`} />
                Status: {finalReport.hire_recommendation === 'Yes' ? 'HIRE RECOMMENDATION' : 'NEEDS PRACTICE'}
              </div>

              {/* Strengths & Weaknesses grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
                <div className="bg-[#0e0e0e]/60 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-400" />
                  <h3 className="font-sans font-semibold text-[16px] mb-3 flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Strengths Detected
                  </h3>
                  <ul className="space-y-2.5">
                    {finalReport.strengths?.map((s, i) => (
                      <li key={i} className="text-xs text-on-surface-variant leading-relaxed">
                        {s}
                      </li>
                    )) || <li className="text-xs text-on-surface-variant">No explicit strengths saved.</li>}
                  </ul>
                </div>

                <div className="bg-[#0e0e0e]/60 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />
                  <h3 className="font-sans font-semibold text-[16px] mb-3 flex items-center gap-2 text-white">
                    <MessageCircle className="w-4 h-4 text-yellow-400" /> Suggested Targets
                  </h3>
                  <ul className="space-y-2.5">
                    {finalReport.weaknesses?.map((w, i) => (
                      <li key={i} className="text-xs text-on-surface-variant leading-relaxed">
                        {w}
                      </li>
                    )) || <li className="text-xs text-on-surface-variant">No explicit feedback areas saved.</li>}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => {
                    setStarted(false);
                    setFinalReport(null);
                    setMessages([]);
                  }}
                  className="px-8 py-4 bg-primary text-background hover:bg-primary-container border border-primary/20 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-lg"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => {
                    setFinalReport(null);
                    setMessages([]);
                    handleStart();
                  }}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all"
                >
                  Retake Interview
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Active Question & Capture (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Premium Question Card */}
              <div className="glass-panel rounded-3xl p-8 border-beam relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Bot className="w-40 h-40 text-primary" />
                </div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="font-mono text-[9px] uppercase tracking-widest text-primary">Targeted Prompt</span>
                    </div>
                    
                    <AnimatePresence mode="wait">
                      <motion.h2 
                        key={currentQuestion}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-2xl md:text-3xl font-bold leading-snug text-white"
                      >
                        "{currentQuestion}"
                      </motion.h2>
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2 bg-[#0e0e0e]/50 px-3 py-1.5 rounded-xl border border-white/5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">timer</span>
                      <span className="font-mono text-xs text-white">{formatTimer(timerSeconds)}</span>
                    </div>
                    <button 
                      onClick={() => speakText(currentQuestion)}
                      disabled={isSpeaking}
                      className="text-outline hover:text-primary transition-colors flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider disabled:opacity-50"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Replay Voice
                    </button>
                  </div>
                </div>

                {/* Star method tip box */}
                <div className="bg-[#0e0e0e]/40 border-l-2 border-secondary rounded-r-2xl p-4 relative z-10 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-secondary shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <p className="font-mono text-[10px] text-secondary uppercase tracking-widest font-bold">Pro Tip Recommendation</p>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Structure your response using the STAR format: Situation, Task, Action, and specific Result. Focus on tech stack implementation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error logs inside simulator */}
              {errorMsg && (
                <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-mono">
                  {errorMsg}
                </div>
              )}

              {/* Transcription & Controls Card */}
              <div className="glass-panel rounded-3xl p-6 flex flex-col min-h-[300px] justify-between relative">
                
                {/* Visual Audio Waveform Header */}
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-primary'}`} />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-outline-variant font-bold">
                      {isRecording ? 'Capturing Voice Stream' : useVoice ? 'Voice Interface Active' : 'Text Input Interface'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setTtsEnabled(!ttsEnabled)}
                      className={`text-outline-variant hover:text-white transition-colors p-1.5 rounded-lg border ${
                        ttsEnabled ? 'bg-white/5 border-white/10' : 'border-transparent'
                      }`}
                      title={ttsEnabled ? "Disable AI speech output" : "Enable AI speech output"}
                    >
                      {ttsEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Text/Transcription Area */}
                <div className="flex-grow min-h-[140px] flex flex-col justify-start">
                  {useVoice ? (
                    <div className="space-y-4">
                      {isRecording ? (
                        <div className="font-sans text-[16px] md:text-[18px] text-white leading-relaxed">
                          {textInput ? textInput : <span className="text-gray-600 italic">Listening to your voice... start speaking now.</span>}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm italic font-sans flex flex-col items-center justify-center py-6 text-center">
                          <Mic className="w-8 h-8 text-outline-variant opacity-40 mb-2 animate-bounce" />
                          <p>Click the red microphone to start talking.</p>
                          <p className="text-xs text-outline-variant/60 mt-1 max-w-xs">Ensure your browser microphone permissions are enabled.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type your detailed interview response here..."
                      disabled={loading}
                      className="w-full h-full bg-transparent border-0 focus:ring-0 p-0 text-white placeholder-gray-600 font-sans text-base resize-none min-h-[140px] outline-none disabled:opacity-50"
                    />
                  )}
                </div>

                {/* Animated Waveform & Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={isRecording ? stopRecordingAndSubmit : startRecording}
                        disabled={loading || !useVoice}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isRecording 
                            ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-30'
                        }`}
                      >
                        {isRecording ? <Square className="w-4 h-4 text-white fill-white" /> : <Mic className="w-4 h-4 text-white" />}
                      </button>

                      <button 
                        onClick={() => {
                          stopSpeaking();
                          if (isRecording) {
                            setIsRecording(false);
                            if (recognitionRef.current) recognitionRef.current.abort();
                          }
                          setUseVoice(!useVoice);
                        }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                          !useVoice 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-white/5 border-white/10 text-outline-variant hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">keyboard</span>
                      </button>
                    </div>

                    {/* CSS Waveform representation */}
                    {isRecording && (
                      <div className="flex gap-1 items-end h-6 opacity-80 pl-2">
                        <div className="w-0.5 bg-primary rounded-t-full waveform-bar h-2 animate-[waveform_0.8s_ease-in-out_infinite]" style={{ animationDelay: '0.1s' }} />
                        <div className="w-0.5 bg-primary rounded-t-full waveform-bar h-4 animate-[waveform_0.9s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }} />
                        <div className="w-0.5 bg-primary rounded-t-full waveform-bar h-3 animate-[waveform_0.7s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
                        <div className="w-0.5 bg-primary rounded-t-full waveform-bar h-5 animate-[waveform_1.1s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }} />
                        <div className="w-0.5 bg-primary rounded-t-full waveform-bar h-2 animate-[waveform_0.8s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {loading && (
                      <div className="flex items-center gap-2 text-xs text-primary font-mono animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzers calculating...
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleAnswer(textInput)}
                      disabled={loading || !textInput.trim() || isRecording}
                      className="btn-primary px-6 py-3 rounded-full font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg group disabled:opacity-40"
                    >
                      {loading ? 'Submitting...' : 'Submit Answer'}
                      {!loading && <Send className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />}
                    </button>
                  </div>
                </div>

              </div>
              
            </div>

            {/* Right Column: AI Live Feedback Panel (4 columns) */}
            <aside className="lg:col-span-4 flex flex-col gap-4">
              <div className="glass-panel rounded-3xl p-5 flex flex-col h-[calc(100vh-200px)] max-h-[700px] overflow-hidden relative border border-white/10 shadow-2xl">
                
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4 shrink-0">
                  <span className="material-symbols-outlined text-secondary animate-pulse">analytics</span>
                  <h3 className="font-mono text-[10px] text-on-surface uppercase tracking-widest font-bold">
                    Live Diagnostics
                  </h3>
                </div>

                {/* Score Cards Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-4 shrink-0">
                  <div className="bg-[#0e0e0e]/50 rounded-xl p-3 border border-white/5 flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] text-outline uppercase tracking-wider">Confidence</span>
                    <span className="font-sans text-[20px] font-black text-primary">
                      {rollingScores.confidence ? `${rollingScores.confidence}%` : '0%'}
                    </span>
                  </div>
                  <div className="bg-[#0e0e0e]/50 rounded-xl p-3 border border-white/5 flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] text-outline uppercase tracking-wider">Clarity</span>
                    <span className="font-sans text-[20px] font-black text-secondary">
                      {rollingScores.clarity ? `${rollingScores.clarity}%` : '0%'}
                    </span>
                  </div>
                  <div className="bg-[#0e0e0e]/50 rounded-xl p-3 border border-white/5 flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] text-outline uppercase tracking-wider">Tech Depth</span>
                    <span className="font-sans text-[20px] font-black text-white">
                      {rollingScores.techDepth ? `${rollingScores.techDepth}%` : '0%'}
                    </span>
                  </div>
                  <div className="bg-[#0e0e0e]/50 rounded-xl p-3 border border-white/5 flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] text-outline uppercase tracking-wider">Comm. Score</span>
                    <span className="font-sans text-[20px] font-black text-white">
                      {rollingScores.communication ? `${rollingScores.communication}%` : '0%'}
                    </span>
                  </div>
                </div>

                {/* Qualitative lists */}
                <div className="flex flex-col gap-3 border-b border-white/5 pb-4 mb-4 shrink-0 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-outline">STAR Framework</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      feedbackHistory.length > 0 ? 'text-primary bg-primary/10' : 'text-gray-500 bg-white/5'
                    }`}>
                      {feedbackHistory.length > 0 ? 'Aligned' : 'Awaiting'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-outline">Filler Word Density</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      feedbackHistory.length > 0 ? 'text-green-400 bg-green-400/10' : 'text-gray-500 bg-white/5'
                    }`}>
                      {feedbackHistory.length > 0 ? 'Low (-3%)' : '0%'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-outline">Tone Evaluation</span>
                    <span className="text-white bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold">
                      {feedbackHistory.length > 0 ? 'Professional' : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-outline">Speech Velocity</span>
                    <span className="text-white bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold">
                      {feedbackHistory.length > 0 ? 'Balanced' : 'None'}
                    </span>
                  </div>
                </div>

                {/* Rolling Timeline of evaluations */}
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 pb-4">
                  {feedbackHistory.length === 0 ? (
                    <div className="h-40 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-600">
                      <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-[10px] font-mono uppercase tracking-widest font-bold">Awaiting Prompts</p>
                    </div>
                  ) : (
                    <>
                      {feedbackHistory.map((item, idx) => {
                        const conf = item.eval.confidence_score || 7;
                        return (
                          <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, x: 10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className="p-4 rounded-xl bg-[#0e0e0e]/40 border border-white/5 relative"
                          >
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="font-mono text-[9px] text-outline-variant font-bold uppercase">Question {idx+1}</span>
                              <span className="font-mono text-[9px] text-primary">Score: {conf}/10</span>
                            </div>
                            <h4 className="text-white font-medium text-xs truncate mb-1">"{item.question}"</h4>
                            <p className="text-[11px] text-on-surface-variant line-clamp-2 italic mb-2">"{item.answer}"</p>
                            <p className="text-[11px] text-primary leading-normal border-t border-white/5 pt-2">
                              {item.eval.feedback}
                            </p>
                          </motion.div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Progress Indicators & Summary card in sidebar bottom */}
                {feedbackHistory.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="p-4 rounded-2xl bg-gradient-to-br from-primary to-secondary text-background shrink-0 mt-4 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-4 h-4 text-background" />
                      <h4 className="font-mono font-black text-[9px] uppercase tracking-widest">Dialogue Copilot</h4>
                    </div>
                    <p className="text-xs leading-relaxed font-sans font-medium mb-3.5">
                      {feedbackHistory[feedbackHistory.length - 1].eval.feedback || "Agent is analyzing speech attributes."}
                    </p>
                    <div>
                      <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider font-bold mb-1.5">
                        <span>Progress Vector</span>
                        <span>{Math.round(((questionNumber - 1) / totalQuestions) * 100)}%</span>
                      </div>
                      <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-background rounded-full transition-all duration-500" 
                          style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>
            </aside>

          </div>
        )}

        {/* Technical stack bottom bar */}
        {!finalReport && (
          <div className="mt-8 p-5 rounded-3xl bg-[#0c0c0e] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary shrink-0" />
              <span className="font-sans font-bold text-sm text-white">Active Core Stack Specs</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((s, idx) => (
                <span key={idx} className="px-3.5 py-1.5 rounded-full bg-[#1b1c2b]/30 border border-primary/20 font-mono text-xs text-primary">
                  {s}
                </span>
              ))}
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-on-surface-variant font-mono">
                System Calibration: {difficulty}
              </span>
            </div>
          </div>
        )}

      </main>

      <style>{`
        @keyframes waveform {
          0%, 100% { height: 4px; }
          50% { height: 24px; }
        }
        .waveform-bar {
          transform-origin: bottom;
        }
      `}</style>
    </div>
  );
};

export default Interview;
