"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, RotateCcw, Check, WifiOff, Keyboard } from "lucide-react";

export default function VoiceRecorder({ value, onChange, questionIndex }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [waveValues, setWaveValues] = useState([4, 8, 12, 8, 4, 16, 8, 4, 12, 8]);
  const [mode, setMode] = useState("voice"); // "voice" | "text"
  const recognitionRef = useRef(null);
  const waveIntervalRef = useRef(null);
  const baseTranscriptRef = useRef(value || "");

  // Reset when question changes
  useEffect(() => {
    baseTranscriptRef.current = value || "";
    setLiveTranscript("");
    setNetworkError(false);
    stopRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    clearInterval(waveIntervalRef.current);
    setIsRecording(false);
    setLiveTranscript("");
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setMode("text");
      return;
    }

    setNetworkError(false);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interim = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += t + " ";
        else interim += t;
      }
      if (finalChunk) {
        baseTranscriptRef.current = (baseTranscriptRef.current + " " + finalChunk).trim();
        onChange(baseTranscriptRef.current);
      }
      setLiveTranscript(interim);
    };

    recognition.onerror = (e) => {
      if (e.error === "network") {
        // Network blocked — switch to text mode silently
        setNetworkError(true);
        setMode("text");
        stopRecording();
      } else if (e.error !== "aborted" && e.error !== "no-speech") {
        console.error("Speech error:", e.error);
        stopRecording();
      }
    };

    recognition.onend = () => {
      clearInterval(waveIntervalRef.current);
      setIsRecording(false);
      setLiveTranscript("");
    };

    recognition.start();
    setIsRecording(true);

    waveIntervalRef.current = setInterval(() => {
      setWaveValues(Array.from({ length: 10 }, () => Math.floor(Math.random() * 28) + 4));
    }, 120);
  }, [onChange, stopRecording]);

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const clearAnswer = () => {
    stopRecording();
    baseTranscriptRef.current = "";
    onChange("");
    setLiveTranscript("");
  };

  const wordCount = (value || "").trim().split(/\s+/).filter(Boolean).length;
  const displayText = value || "";
  const combinedPreview = isRecording && liveTranscript
    ? (displayText ? displayText + " " : "") + liveTranscript
    : displayText;

  // ── Text-only fallback (no speech support or network blocked) ──
  if (!isSupported || (networkError && mode === "text")) {
    return (
      <div className="space-y-3">
        {networkError && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <WifiOff size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-500 text-sm font-medium">Voice unavailable on this network</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Speech recognition is blocked by your network firewall. Type your answer below — it will be scored the same way.
              </p>
            </div>
          </motion.div>
        )}
        {!isSupported && (
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <MicOff size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-500 text-sm font-medium">Voice not supported in this browser</p>
              <p className="text-muted-foreground text-xs mt-0.5">Use Chrome or Edge for voice. Type your answer below.</p>
            </div>
          </div>
        )}
        <TextAnswerArea value={value} onChange={onChange} wordCount={wordCount} onClear={clearAnswer} />
      </div>
    );
  }

  // ── Manual text mode (user switched) ──
  if (mode === "text") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button onClick={() => setMode("voice")}
            className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-400 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-500/10">
            <Mic size={12} /> Switch to Voice
          </button>
        </div>
        <TextAnswerArea value={value} onChange={onChange} wordCount={wordCount} onClear={clearAnswer} />
      </div>
    );
  }

  // ── Voice mode ──
  return (
    <div className="space-y-4">
      {/* Mic + waveform */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative">
          {isRecording && (
            <>
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-red-500/30" />
              <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                className="absolute inset-0 rounded-full bg-red-500/20" />
            </>
          )}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
              isRecording
                ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/40"
                : "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/30"
            }`}>
            {isRecording ? <MicOff size={30} className="text-white" /> : <Mic size={30} className="text-white" />}
          </motion.button>
        </div>

        {/* Status */}
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div key="rec" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2">
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-500 text-sm font-semibold">Recording... speak now</span>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-muted-foreground text-sm">
              {displayText ? "Tap mic to continue recording" : "Tap the mic to start speaking"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waveform */}
        <AnimatePresence>
          {isRecording && (
            <motion.div initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }} className="flex items-center gap-1 h-10">
              {waveValues.map((h, i) => (
                <motion.div key={i} animate={{ height: h }} transition={{ duration: 0.12 }}
                  className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-violet-400"
                  style={{ height: h }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live transcript */}
      <AnimatePresence>
        {isRecording && liveTranscript && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-4 py-3">
            <p className="text-xs text-indigo-400 font-medium mb-1 flex items-center gap-1">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>●</motion.span>
              Live transcript
            </p>
            <p className="text-sm text-foreground/70 italic">{liveTranscript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editable transcript */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-muted-foreground">Your Answer Transcript</label>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${wordCount >= 30 ? "text-emerald-500" : "text-muted-foreground"}`}>
              {wordCount} words {wordCount >= 30 ? "✓" : "— aim for 30+"}
            </span>
            <button onClick={() => setMode("text")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-indigo-500 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-500/10">
              <Keyboard size={11} /> Type instead
            </button>
            {displayText && (
              <button onClick={clearAnswer}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10">
                <RotateCcw size={11} /> Clear
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <textarea
            value={combinedPreview}
            onChange={(e) => {
              baseTranscriptRef.current = e.target.value;
              onChange(e.target.value);
            }}
            placeholder="Your spoken answer will appear here. You can also type or edit directly..."
            rows={6}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 resize-none transition-all"
          />
          {wordCount >= 30 && (
            <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TextAnswerArea({ value, onChange, wordCount, onClear }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-muted-foreground">Your Answer</label>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${wordCount >= 30 ? "text-emerald-500" : "text-muted-foreground"}`}>
            {wordCount} words {wordCount >= 30 ? "✓" : "— aim for 30+"}
          </span>
          {value && (
            <button onClick={onClear}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10">
              <RotateCcw size={11} /> Clear
            </button>
          )}
        </div>
      </div>
      <div className="relative">
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here... (aim for 30+ words for full marks)"
          rows={7}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 resize-none transition-all"
        />
        {wordCount >= 30 && (
          <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={12} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
