import React, { useState } from 'react';
import { ArrowLeft, HeartPulse, AlertCircle } from 'lucide-react';
import UploadBox from '../components/UploadBox';
import { analyzeDocument } from '../api';
import { SAMPLE_LAB_REPORT, SAMPLE_PRESCRIPTION } from '../sampleData';

export default function Analyze({
  onNavigate,
  onAnalysisComplete,
  language,
  onLanguageChange,
  initialSample = null,
}) {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const isUrdu = language === 'ur';

  let initialText = '';
  if (initialSample === 'lab') {
    initialText = SAMPLE_LAB_REPORT;
  } else if (initialSample === 'prescription') {
    initialText = SAMPLE_PRESCRIPTION;
  }

  const handleAnalyze = async ({ file, text, language: selectedLang }) => {
    setLoading(true);
    setApiError(null);

    try {
      const result = await analyzeDocument({
        file,
        text,
        language: selectedLang,
      });

      // Save to localStorage as per requirements
      try {
        localStorage.setItem('sehatsamajh_last_result', JSON.stringify(result));
        localStorage.setItem('sehatsamajh_last_lang', selectedLang);
      } catch (storageErr) {
        console.warn('LocalStorage error:', storageErr);
      }

      onAnalysisComplete(result);
      onNavigate('result');
    } catch (err) {
      setApiError(err.message || 'An error occurred during analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isUrdu ? 'مرکزی صفحہ پر جائیں' : 'Back to Home'}</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 text-base">SehatSamajh</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full">
        <div className="text-center mb-8">
          <h2 className={`text-2xl sm:text-4xl font-extrabold text-slate-950 ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu
              ? 'طبی دستاویز کا جائزہ لیں'
              : language === 'roman_ur'
              ? 'Medical Report Ka Jaiza Lein'
              : 'Analyze Your Medical Document'}
          </h2>
          <p className={`mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu
              ? 'لیب رپورٹ یا ڈاکٹر کے نسخہ کی تصویر اپلوڈ کریں، یا متن درج کریں۔'
              : language === 'roman_ur'
              ? 'Photo ya PDF upload karein ya text paste karein.'
              : 'Upload a clear photo, PDF, or paste text from your lab report or prescription.'}
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold mb-1">Analysis Error</h4>
              <p>{apiError}</p>
            </div>
          </div>
        )}

        <UploadBox
          onAnalyze={handleAnalyze}
          loading={loading}
          language={language}
          onLanguageChange={onLanguageChange}
          initialText={initialText}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        SehatSamajh • AI for Accessible Healthcare (UN SDG 3)
      </footer>
    </div>
  );
}
