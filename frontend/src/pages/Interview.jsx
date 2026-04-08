import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Square, Play, Bot, User, Volume2, VolumeX, Loader2, Lightbulb, CheckCircle2, MessageCircle, Sparkles, Star } from 'lucide-react';
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

const LEVELS = ['Fresher', 'Intermediate', 'Advanced'];

const Interview = () => {
  // Setup state
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('Fresher');
  const [techStack, setTechStack] = useState('');
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

  // Refs
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);
  const sttFallbackTextRef = useRef('');
  const mediaRecorderRef = useRef(null);

  // Stop TTS if unmounted
  useEffect(() => {
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const speakText = async (text) => {
    if (!ttsEnabled) return;
    setIsSpeaking(true);

    try {
      const audioBlob = await textToSpeech(text);
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
    } catch {
      fallbackSpeak(text);
    }
  };

  const fallbackSpeak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const handleStart = async () => {
    if (!role || !techStack) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await startInterview({ role, level, tech_stack: techStack });
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
        setErrorMsg('Speech recognition is not supported. Please type.');
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
      };
      
      recognition.onerror = (e) => {
        if (e.error === 'not-allowed') {
          setErrorMsg('Microphone access denied. Please allow it or switch to text.');
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
    } catch {
      setErrorMsg('Microphone access not allowed. Falling back to text mode.');
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
        setErrorMsg('Could not hear anything clearly. Please try again or type.');
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

  if (!started) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#050505] text-white">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-4">
               <span className="text-cyan-400">Interview</span> Simulator
            </h1>
            <p className="text-gray-400 text-lg">
              Set up your environment. Our AI will conduct a dynamic behavioral and technical interview.
            </p>
          </motion.div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0e1116] border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Role *</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500/50 transition-colors">
                <option value="" disabled className="bg-gray-900">Select a role...</option>
                {ROLES.map((r) => <option key={r} value={r} className="bg-gray-900">{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LEVELS.map((l) => (
                  <button key={l} onClick={() => setLevel(l)} className={`py-3.5 rounded-xl font-medium transition-all duration-300 border ${level === l ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tech Stack / Core Skills *</label>
              <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="e.g. React, Node.js, Agile, Product Strategy..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors" />
            </div>

            <button onClick={handleStart} disabled={!role || !techStack || loading} className="w-full py-4 mt-4 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Booting Simulator...' : 'Initialize Secure Session'}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Active Interview View
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Interview</span> Simulator
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Hone your responses with our real-time AI behavioral analysis and career path feedback loop.
          </p>
        </div>

        {finalReport ? (
           // Final Report View
           <div className="bg-[#0e1116] border border-white/5 rounded-3xl p-8 max-w-3xl mx-auto text-center shadow-2xl">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 mx-auto flex items-center justify-center mb-6">
                 <span className="text-4xl font-bold text-white">{finalReport.final_score}</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Simulation Complete</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">{finalReport.summary}</p>

              <div className={`inline-block px-6 py-2 rounded-full font-bold border mb-8 ${finalReport.hire_recommendation === 'Yes' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                 System Status: {finalReport.hire_recommendation === 'Yes' ? 'APPROVED' : 'NEEDS IMPROVEMENT'}
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                   <h3 className="font-bold text-lg mb-3">Strengths Detected</h3>
                   <ul className="space-y-2">
                     {finalReport.strengths?.map((s,i) => <li key={i} className="text-sm text-gray-300 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />{s}</li>)}
                   </ul>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
                   <h3 className="font-bold text-lg mb-3">Targeted Weaknesses</h3>
                   <ul className="space-y-2">
                     {finalReport.weaknesses?.map((w,i) => <li key={i} className="text-sm text-gray-300 flex items-start gap-2"><MessageCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />{w}</li>)}
                   </ul>
                </div>
              </div>

              <button onClick={() => { setStarted(false); setFinalReport(null); setMessages([]); }} className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">
                Return to Setup Dashboard
              </button>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Flashcard & Input */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Question Flashcard */}
              <div className="p-8 rounded-[2rem] bg-[#0a0c10] border border-white/5 shadow-2xl relative">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1.5 bg-purple-500/10 text-purple-400 font-bold uppercase tracking-widest text-[10px] rounded-lg border border-purple-500/20">
                      Targeted Analysis
                    </span>
                    <span className="text-sm text-gray-500 font-medium">Step {questionNumber} of {totalQuestions}</span>
                  </div>
                  <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-400 font-mono text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Live
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.h2 
                    key={currentQuestion}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="text-3xl md:text-4xl font-bold leading-snug mb-10 text-white"
                  >
                    "{currentQuestion}"
                  </motion.h2>
                </AnimatePresence>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-gray-500 text-sm">
                     <Lightbulb className="w-4 h-4 text-cyan-400" />
                     <span className="italic">Hint: Focus on the STAR method</span>
                   </div>
                   <button onClick={() => setTtsEnabled(!ttsEnabled)} className="text-gray-600 hover:text-white transition-colors">
                     {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                   </button>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Input Widget */}
              <div className="p-6 rounded-[2rem] bg-[#0a0c10] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                
                {useVoice ? (
                  <>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                        <Volume2 className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold leading-tight">Audio Interface</p>
                        <p className="text-xs text-gray-500">{isRecording ? "Listening to your response..." : "System ready for voice capture"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Audio visualizer mockup */}
                      <div className="flex gap-1 h-8 items-center mr-2">
                        <div className={`w-1 rounded-full bg-cyan-400 transition-all ${isRecording ? 'h-6 animate-[bounce_1s_infinite]' : 'h-2'}`} />
                        <div className={`w-1 rounded-full bg-cyan-600 transition-all ${isRecording ? 'h-8 animate-[bounce_1.2s_infinite]' : 'h-4'}`} />
                        <div className={`w-1 rounded-full bg-cyan-500 transition-all ${isRecording ? 'h-5 animate-[bounce_0.8s_infinite]' : 'h-3'}`} />
                        <div className={`w-1 rounded-full bg-cyan-300 transition-all ${isRecording ? 'h-7 animate-[bounce_1.1s_infinite]' : 'h-2'}`} />
                      </div>

                      <button 
                        onClick={isRecording ? stopRecordingAndSubmit : startRecording}
                        disabled={loading}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                          isRecording 
                            ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                            : 'bg-[#1a1f26] border border-white/10 hover:bg-white/10'
                        } disabled:opacity-50`}
                      >
                        {isRecording ? <Square className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                      </button>

                      <div className="flex flex-col gap-2">
                        {isRecording ? (
                          <button onClick={stopRecordingAndSubmit} className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold hover:opacity-90 transition-opacity shadow-lg">
                            Submit Answer
                          </button>
                        ) : (
                          <button onClick={() => setUseVoice(false)} className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-colors text-sm text-gray-300">
                            Switch to Text
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full flex items-center gap-3">
                    <input 
                      type="text" 
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnswer(textInput)}
                      placeholder="Type your response here..."
                      disabled={loading || isRecording}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
                    />
                    <button 
                      onClick={() => handleAnswer(textInput)}
                      disabled={!textInput.trim() || loading}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
                    >
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                    <button onClick={() => setUseVoice(true)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-gray-400 shrink-0">
                       <Mic className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              
              {loading && !isRecording && (
                <p className="text-cyan-400 text-sm animate-pulse text-center">AI is analyzing your response...</p>
              )}

            </div>

            {/* Right Column: Live Feedback */}
            <div className="lg:col-span-5 flex flex-col h-[650px]">
              <div className="flex justify-between items-end mb-4 shrink-0">
                <h3 className="text-2xl font-bold">Live Feedback</h3>
                <span className="text-sm text-cyan-400 font-semibold cursor-pointer">Score metrics</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-4 block">
                {feedbackHistory.length === 0 && !loading ? (
                  <div className="h-40 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-600">
                    <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm uppercase tracking-widest font-bold">Awaiting Input</p>
                  </div>
                ) : (
                  <>
                    {feedbackHistory.map((item, i) => {
                       const conf = item.eval.confidence_score || 0;
                       return (
                         <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-2xl bg-[#0a0c10] border border-white/5 relative shadow-lg">
                           <div className="absolute top-6 right-6 text-[10px] font-bold tracking-widest text-gray-500 uppercase">Question {i+1}</div>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-4 ${conf >= 7 ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                             <CheckCircle2 className={`w-4 h-4 ${conf >= 7 ? 'text-green-400' : 'text-yellow-400'}`} />
                           </div>
                           <h4 className="text-white font-bold mb-2 pr-20 truncate">{item.question}</h4>
                           <p className="text-sm text-gray-500 line-clamp-2 mb-4 italic">"{item.answer}"</p>
                           <div className="flex flex-wrap gap-2">
                             <span className="px-2.5 py-1 bg-cyan-900/30 text-cyan-400 text-[10px] rounded-md font-bold uppercase border border-cyan-500/20">Clarity: {item.eval.communication_score * 10}%</span>
                             <span className={`px-2.5 py-1 text-[10px] rounded-md font-bold uppercase border ${conf >= 7 ? 'bg-purple-900/30 text-purple-400 border-purple-500/20' : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/20'}`}>
                               {conf >= 7 ? 'Tone: Confident' : 'Hesitation Detected'}
                             </span>
                           </div>
                         </motion.div>
                       );
                    })}
                  </>
                )}

                {/* Constant AI Summary Card */}
                {feedbackHistory.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white relative shadow-xl overflow-hidden mt-4">
                    <div className="flex items-center gap-2 mb-4">
                       <Sparkles className="w-5 h-5 text-white/90" />
                       <h4 className="font-bold tracking-widest text-xs uppercase">AI Summary</h4>
                    </div>
                    <p className="text-sm leading-relaxed mb-6 font-medium">
                      {feedbackHistory[feedbackHistory.length - 1].eval.feedback || "Your responses are being analyzed to measure confidence, technical accuracy, and structural alignment."}
                    </p>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
                        <span>Session Progress</span>
                        <span>{Math.round((questionNumber - 1) / totalQuestions * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-500" style={{width: `${((questionNumber - 1) / totalQuestions * 100)}%`}} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Skills Row */}
        {!finalReport && (
          <div className="mt-8 p-6 rounded-3xl bg-[#0a0c10] border border-white/5 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 shadow-xl">
             <div className="flex gap-2 items-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center shrink-0">
                  <Star className="w-3.5 h-3.5 text-black fill-black" />
                </div>
                <span className="font-bold text-white text-sm sm:text-base">Targeted Frameworks</span>
             </div>
             <div className="flex flex-wrap gap-2">
               {techStack.split(',').map((skill, index) => {
                 const s = skill.trim();
                 if (!s) return null;
                 return (
                   <span key={index} className="px-4 py-1.5 rounded-full bg-[#0e1f29] text-cyan-400 text-xs font-bold border border-cyan-900/50">
                     {s}
                   </span>
                 );
               })}
               <span className="px-4 py-1.5 rounded-full bg-purple-900/20 text-purple-400 border border-purple-500/20 text-xs font-bold">
                 Leadership
               </span>
               <span className="px-4 py-1.5 rounded-full bg-white/5 text-gray-400 border border-white/5 text-xs font-bold">
                 Communication
               </span>
             </div>
          </div>
        )}
      </div>
      
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Interview;
