import React from 'react';
import {
  FileText,
  ShieldCheck,
  Languages,
  Activity,
  ArrowRight,
  Sparkles,
  HeartPulse,
  Stethoscope,
  Pill,
  Clock,
} from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';
import { t } from '../i18n';

export default function Home({ onNavigate, language, onLanguageChange, hasSavedResult = false }) {
  const isUrdu = language === 'ur';

  return (
    <div className="min-h-screen flex flex-col justify-between" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>{isUrdu ? 'صحت' : 'Sehat'}</span>
                <span className="text-emerald-600">{isUrdu ? 'سمجھ' : 'Samajh'}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 ml-1">
                  AI
                </span>
              </h1>
            </div>
          </div>

          <LanguageToggle currentLang={language} onChange={onLanguageChange} />
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex-1 flex flex-col items-center text-center">
        {/* SDG 3 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{t('sdgBadge', language)}</span>
        </div>

        {/* Main Headline */}
        <h2
          className={`text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl ${
            isUrdu ? 'font-urdu leading-normal' : ''
          }`}
        >
          {t('heroTitle', language)}{' '}
          <span className="text-emerald-600">{t('heroTitleHighlight', language)}</span>
        </h2>

        {/* One-line Value Proposition */}
        <p
          className={`mt-6 text-base sm:text-xl text-slate-600 max-w-2xl leading-relaxed ${
            isUrdu ? 'font-urdu' : ''
          }`}
        >
          {t('heroSubtitle', language)}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 w-full">
          <button
            type="button"
            onClick={() => onNavigate('analyze')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base sm:text-lg shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all flex items-center justify-center gap-3"
          >
            <span>{t('ctaUpload', language)}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('analyze', { sample: 'lab', autoAnalyze: true })}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base sm:text-lg border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>{t('ctaSampleLab', language)}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('analyze', { sample: 'rx', autoAnalyze: true })}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base sm:text-lg border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Pill className="w-5 h-5 text-emerald-600" />
            <span>{t('ctaSamplePrescription', language)}</span>
          </button>

          {hasSavedResult && (
            <button
              type="button"
              onClick={() => onNavigate('result')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-base border border-emerald-200 transition-all"
            >
              {t('viewSaved', language)}
            </button>
          )}
        </div>

        {/* 3-Step "How It Works" Section */}
        <section className="mt-20 sm:mt-24 w-full max-w-4xl text-left border-t border-slate-200/80 pt-16">
          <div className="text-center mb-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 block mb-1">
              Workflow
            </span>
            <h3 className={`text-2xl sm:text-3xl font-extrabold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
              {t('howItWorksTitle', language)}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className={`text-lg font-bold text-slate-900 mb-2 ${isUrdu ? 'font-urdu' : ''}`}>
                {t('step1Title', language)}
              </h4>
              <p className={`text-sm text-slate-600 leading-relaxed ${isUrdu ? 'font-urdu' : ''}`}>
                {t('step1Desc', language)}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Languages className="w-6 h-6" />
              </div>
              <h4 className={`text-lg font-bold text-slate-900 mb-2 ${isUrdu ? 'font-urdu' : ''}`}>
                {t('step2Title', language)}
              </h4>
              <p className={`text-sm text-slate-600 leading-relaxed ${isUrdu ? 'font-urdu' : ''}`}>
                {t('step2Desc', language)}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h4 className={`text-lg font-bold text-slate-900 mb-2 ${isUrdu ? 'font-urdu' : ''}`}>
                {t('step3Title', language)}
              </h4>
              <p className={`text-sm text-slate-600 leading-relaxed ${isUrdu ? 'font-urdu' : ''}`}>
                {t('step3Desc', language)}
              </p>
            </div>
          </div>
        </section>

        {/* Safety Note */}
        <section className="mt-14 w-full max-w-3xl bg-amber-50/80 border border-amber-200 rounded-3xl p-6 flex items-start gap-4 text-left">
          <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-700 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className={`text-sm sm:text-base font-bold text-amber-950 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'طبی حفاظت کی ضمانت (غیر تشخیصی)' : 'Patient Safety First (Strictly Non-Diagnostic)'}
            </h4>
            <p className={`text-xs sm:text-sm text-amber-900 leading-relaxed ${isUrdu ? 'font-urdu' : ''}`}>
              {t('disclaimerText', language)}
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SehatSamajh. Built for UN Sustainable Development Goal 3 (Good Health & Well-Being).</p>
          <div className="flex items-center gap-4">
            <span>Urdu • Roman Urdu • English</span>
            <span>•</span>
            <span>Powered by Gemini Multimodal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
