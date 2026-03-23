import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Play, Square, RotateCcw, User, Bot, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { startInterview, submitInterviewAnswer, textToSpeech } from '../services/api';

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
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [loading, setLoading] = useState(false);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [useVoice, setUseVoice] = useState(true);

  // Refs
  const chatEndRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);
  const sttFallbackTextRef = useRef('');
  const mediaRecorderRef = useRef(null); // reused to hold mic stream

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = async (text) => {
    if (!ttsEnabled) return;
    setIsSpeaking(true);

    try {
      // Try NVIDIA TTS first
      const audioBlob = await textToSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        // Fallback to browser TTS
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
      const detail = err?.detail || 'Failed to start interview';
      setMessages([{ type: 'error', text: detail }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answerText) => {
    if (!answerText.trim() || !sessionId) return;

    setMessages((prev) => [...prev, { type: 'user', text: answerText }]);
    setTextInput('');
    setLoading(true);

    try {
      const data = await submitInterviewAnswer({
        answer: answerText,
        session_id: sessionId,
      });

      const resp = data.response;
      setQuestionNumber(data.question_number);

      if (resp.type === 'final_report') {
        setFinalReport(resp);
        setMessages((prev) => [...prev, { type: 'report', data: resp }]);
        speakText(resp.summary);
      } else {
        if (resp.evaluation) setCurrentEvaluation(resp.evaluation);
        setCurrentQuestion(resp.question);
        setMessages((prev) => [
          ...prev,
          { type: 'evaluation', data: resp.evaluation },
          { type: 'bot', text: resp.question },
        ]);
        speakText(resp.question);
      }
    } catch (err) {
      const detail = err?.detail || 'Failed to submit answer';
      setMessages((prev) => [...prev, { type: 'error', text: detail }]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      // Request mic permission first (needed for Web Speech API)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        stream.getTracks().forEach((t) => t.stop());
        setMessages((prev) => [...prev, { type: 'error', text: 'Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your answer.' }]);
        return;
      }

      sttFallbackTextRef.current = '';
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        // Store both final and interim — use whatever we have when stopped
        sttFallbackTextRef.current = (finalTranscript + interimTranscript).trim();
      };
      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        if (e.error === 'not-allowed') {
          setMessages((prev) => [...prev, { type: 'error', text: 'Microphone permission denied. Please allow microphone access and try again.' }]);
          setIsRecording(false);
        }
      };
      // Auto-restart if recognition ends prematurely while still recording
      recognition.onend = () => {
        if (isRecording && recognitionRef.current === recognition) {
          try { recognition.start(); } catch { /* already stopped */ }
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);

      // Keep stream ref so we can stop it later
      mediaRecorderRef.current = stream;
    } catch {
      setMessages((prev) => [...prev, { type: 'error', text: 'Microphone access denied.' }]);
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);

    const recognition = recognitionRef.current;
    recognitionRef.current = null;

    // Stop the mic stream
    const stream = mediaRecorderRef.current;
    if (stream && stream.getTracks) {
      stream.getTracks().forEach((t) => t.stop());
    }

    if (!recognition) return;

    // Remove auto-restart handler and wait for final results
    recognition.onend = () => {
      const transcript = sttFallbackTextRef.current;
      if (transcript) {
        handleAnswer(transcript);
      } else {
        setMessages((prev) => [...prev, { type: 'error', text: 'Could not recognize speech. Please try again or type your answer.' }]);
      }
    };
    recognition.stop();
  };

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const resetInterview = () => {
    stopSpeaking();
    setStarted(false);
    setSessionId(null);
    setMessages([]);
    setCurrentQuestion('');
    setCurrentEvaluation(null);
    setFinalReport(null);
    setQuestionNumber(0);
    setTextInput('');
  };

  const ScoreBar = ({ label, score, max = 10 }) => (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / max) * 100}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${
            score >= 7 ? 'bg-green-500' : score >= 4 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
        />
      </div>
      <span className="text-sm font-bold text-white w-8 text-right">{score}</span>
    </div>
  );

  // Setup Screen
  if (!started) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="skillence-gradient">AI Interview</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Practice with a realistic AI interviewer. Get scored and improve.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="" className="bg-gray-900">Select a role...</option>
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-gray-900">{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
              <div className="grid grid-cols-3 gap-3">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`py-3 rounded-lg font-medium transition-all duration-300 border ${
                      level === l
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tech Stack *</label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="e.g. React, Node.js, Python, SQL..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Input Mode</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setUseVoice(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all border ${
                    useVoice
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                  }`}
                >
                  <Mic className="w-4 h-4" /> Voice
                </button>
                <button
                  onClick={() => setUseVoice(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all border ${
                    !useVoice
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                  }`}
                >
                  <Send className="w-4 h-4" /> Text
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              disabled={!role || !techStack || loading}
              className="w-full py-4 rounded-lg font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Starting Interview...
                </span>
              ) : (
                'Start Interview'
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Interview Screen
  return (
    <div className="min-h-screen pt-20 pb-4 px-4 flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{role} Interview</h2>
            <p className="text-sm text-gray-400">{level} | {techStack}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Q{questionNumber}/6</span>
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400"
              title={ttsEnabled ? 'Mute voice' : 'Enable voice'}
            >
              {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={resetInterview}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400"
              title="Restart"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-white/10">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.type === 'bot' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="glass-card p-4 max-w-[80%]">
                      <p className="text-white">{msg.text}</p>
                    </div>
                  </div>
                )}

                {msg.type === 'user' && (
                  <div className="flex gap-3 justify-end">
                    <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl p-4 max-w-[80%]">
                      <p className="text-white">{msg.text}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                )}

                {msg.type === 'evaluation' && msg.data && (
                  <div className="ml-11 glass-card p-4 max-w-[80%] border-l-2 border-cyan-500/50">
                    <p className="text-xs text-cyan-400 font-medium mb-2">EVALUATION</p>
                    <div className="space-y-2">
                      <ScoreBar label="Technical" score={msg.data.technical_score} />
                      <ScoreBar label="Communication" score={msg.data.communication_score} />
                      <ScoreBar label="Confidence" score={msg.data.confidence_score} />
                      <ScoreBar label="Overall" score={msg.data.overall_score} />
                    </div>
                    {msg.data.feedback && (
                      <p className="text-sm text-gray-400 mt-3">{msg.data.feedback}</p>
                    )}
                    {msg.data.improvements?.length > 0 && (
                      <div className="mt-2">
                        {msg.data.improvements.map((imp, i) => (
                          <p key={i} className="text-xs text-gray-500">- {imp}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {msg.type === 'report' && msg.data && (
                  <div className="glass-card p-6 border border-cyan-500/30">
                    <h3 className="text-xl font-bold text-center mb-4">
                      <span className="skillence-gradient">Interview Report</span>
                    </h3>
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-cyan-500/50 mb-2">
                        <span className="text-3xl font-bold text-white">{msg.data.final_score}</span>
                      </div>
                      <p className="text-sm text-gray-400">/10 Overall Score</p>
                    </div>

                    <div className={`text-center mb-6 py-3 rounded-lg font-bold text-lg ${
                      msg.data.hire_recommendation === 'Yes'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      Recommendation: {msg.data.hire_recommendation}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-green-400 mb-2">Strengths</p>
                        {msg.data.strengths?.map((s, i) => (
                          <p key={i} className="text-sm text-gray-300">+ {s}</p>
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-400 mb-2">Weaknesses</p>
                        {msg.data.weaknesses?.map((w, i) => (
                          <p key={i} className="text-sm text-gray-300">- {w}</p>
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm">{msg.data.summary}</p>

                    <button
                      onClick={resetInterview}
                      className="mt-6 w-full py-3 rounded-lg font-medium bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:opacity-90 transition-opacity"
                    >
                      Start New Interview
                    </button>
                  </div>
                )}

                {msg.type === 'error' && (
                  <div className="ml-11 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {msg.text}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        {!finalReport && (
          <div className="border-t border-white/10 pt-4">
            {useVoice ? (
              <div className="flex items-center justify-center gap-4">
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-3 rounded-full bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                    title="Stop speaking"
                  >
                    <VolumeX className="w-5 h-5" />
                  </button>
                )}

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading || isSpeaking}
                  className={`p-6 rounded-full transition-all duration-300 ${
                    isRecording
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 animate-pulse'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/30'
                  } disabled:opacity-50`}
                >
                  {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </motion.button>

                <button
                  onClick={() => setUseVoice(false)}
                  className="p-3 rounded-full bg-white/10 text-gray-400 hover:bg-white/20 transition-colors"
                  title="Switch to text"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setUseVoice(true)}
                  className="p-3 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-colors shrink-0"
                  title="Switch to voice"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnswer(textInput)}
                  placeholder="Type your answer..."
                  disabled={loading}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(textInput)}
                  disabled={!textInput.trim() || loading}
                  className="p-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white disabled:opacity-50 shrink-0"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            )}

            <p className="text-center text-xs text-gray-500 mt-2">
              {useVoice
                ? isRecording
                  ? 'Recording... Click to stop and submit'
                  : 'Click the mic to start answering'
                : 'Press Enter to submit'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;
