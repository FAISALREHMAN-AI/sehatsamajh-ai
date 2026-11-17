import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, RefreshCw } from 'lucide-react';

export default function ReadAloud({ textToRead, language }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const checkVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Check if there is a voice matching language or fallback
        if (language === 'ur') {
          // Look for urdu voice (ur-PK, ur-IN, ur)
          const urVoice = voices.find(v => v.lang.startsWith('ur') || v.name.toLowerCase().includes('urdu'));
          setVoiceAvailable(!!urVoice);
        } else {
          // English or Roman Urdu can use standard English voices
          const enVoice = voices.find(v => v.lang.startsWith('en'));
          setVoiceAvailable(!!enVoice || voices.length > 0);
        }
      };

      checkVoices();
      window.speechSynthesis.onvoiceschanged = checkVoices;

      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    } else {
      setIsSupported(false);
    }
  }, [language]);

  // If browser doesn't support Web Speech API or voice is unavailable, hide it
  if (!isSupported || !voiceAvailable) {
    return null;
  }

  const handleSpeak = () => {
    if (!textToRead) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utteranceRef.current = utterance;

    const voices = window.speechSynthesis.getVoices();
    if (language === 'ur') {
      const urVoice = voices.find(v => v.lang.startsWith('ur') || v.name.toLowerCase().includes('urdu'));
      if (urVoice) utterance.voice = urVoice;
      utterance.lang = 'ur-PK';
      utterance.rate = 0.9;
    } else {
      const enVoice = voices.find(v => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl text-emerald-900 text-xs sm:text-sm font-medium">
      <Volume2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
      <span className="hidden sm:inline">
        {language === 'ur' ? 'آواز میں سنیں:' : language === 'roman_ur' ? 'Awaaz mein sunein:' : 'Read Aloud:'}
      </span>

      {!isPlaying ? (
        <button
          type="button"
          onClick={handleSpeak}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition-colors"
          title="Play audio summary"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{language === 'ur' ? 'سنیں' : 'Play'}</span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5">
          {isPaused ? (
            <button
              type="button"
              onClick={handleSpeak}
              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              title="Resume"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="p-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
              title="Pause"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
          <button
            type="button"
            onClick={handleStop}
            className="p-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
            title="Stop"
          >
            <VolumeX className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-semibold text-emerald-800 animate-pulse">
            {isPaused ? 'Paused' : 'Playing...'}
          </span>
        </div>
      )}
    </div>
  );
}
