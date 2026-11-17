import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Result from './pages/Result';

export default function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'analyze' | 'result'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sehatsamajh_last_lang') || 'en';
  });
  const [result, setResult] = useState(() => {
    try {
      const saved = localStorage.getItem('sehatsamajh_last_result');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [initialSample, setInitialSample] = useState(null);

  // Sync document direction and font attributes with active language
  useEffect(() => {
    if (language === 'ur') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ur');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', language === 'roman_ur' ? 'ur-Latn' : 'en');
    }
    localStorage.setItem('sehatsamajh_last_lang', language);
  }, [language]);

  const handleNavigate = (targetScreen, options = {}) => {
    if (options.sample) {
      setInitialSample(options.sample);
    } else {
      setInitialSample(null);
    }
    setScreen(targetScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = (newResult) => {
    setResult(newResult);
  };

  return (
    <div className={`min-h-screen ${language === 'ur' ? 'font-urdu' : 'font-sans'}`}>
      {screen === 'home' && (
        <Home
          onNavigate={handleNavigate}
          language={language}
          onLanguageChange={setLanguage}
          hasSavedResult={!!result}
        />
      )}

      {screen === 'analyze' && (
        <Analyze
          onNavigate={handleNavigate}
          onAnalysisComplete={handleAnalysisComplete}
          language={language}
          onLanguageChange={setLanguage}
          initialSample={initialSample}
        />
      )}

      {screen === 'result' && (
        <Result
          result={result}
          language={language}
          onLanguageChange={setLanguage}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
