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
                <span>صحت</span>
                <span className="text-emerald-600">سمجھ</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 ml-1">
                  SehatSamajh
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
          <span>AI for Accessible Healthcare & Well-Being (UN SDG 3)</span>
        </div>

        {/* Main Headline */}
        <h2
          className={`text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl ${
            isUrdu ? 'font-urdu leading-normal' : ''
          }`}
        >
          {isUrdu ? (
            <>اپنی میڈیکل رپورٹس اور نسخہ جات کو <span className="text-emerald-600">آسان اردو</span> میں سمجھیں</>
          ) : language === 'roman_ur' ? (
            <>Apni medical reports aur prescription ko <span className="text-emerald-600">Aasan Roman Urdu</span> mein samjhein</>
          ) : (
            <>Understand your medical reports and prescriptions in <span className="text-emerald-600">simple, everyday language</span></>
          )}
        </h2>

        {/* One-line Value Proposition */}
        <p
          className={`mt-6 text-base sm:text-xl text-slate-600 max-w-2xl leading-relaxed ${
            isUrdu ? 'font-urdu' : ''
          }`}
        >
          {isUrdu
            ? 'پیچیدہ طبی اصطلاحات اور انگریزی رپورٹس کی آسان الفاظ میں وضاحت حاصل کریں۔ کوئی طبی تشخیص نہیں، صرف بہتر آگاہی۔'
            : language === 'roman_ur'
            ? 'Mushkil lab reports aur doctor ke nuskhe ki aasan wazahat hasil karein. Koi bimari diagnose nahi, sirf behtar samajh.'
            : 'Turn complex medical jargon into clear, 6th-grade explanations in Urdu, Roman Urdu, or English. Strictly educational and non-diagnostic.'}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onNavigate('analyze')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base sm:text-lg shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all flex items-center justify-center gap-3"
          >
            <span>{isUrdu ? 'اپنی رپورٹ اپلوڈ کریں' : language === 'roman_ur' ? 'Report Upload Karein' : 'Upload Medical Document'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('analyze', { sample: 'lab' })}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base sm:text-lg border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>{isUrdu ? 'ڈیمو رپورٹ آزمائیں' : language === 'roman_ur' ? 'Sample Report Try Karein' : 'Try a Sample Report'}</span>
          </button>

          {hasSavedResult && (
            <button
              type="button"
              onClick={() => onNavigate('result')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-base border border-emerald-300 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>{isUrdu ? 'پچھلا نتیجہ دیکھیں' : language === 'roman_ur' ? 'Pichla Result Dekhein' : 'View Last Result'}</span>
            </button>
          )}
        </div>

        {/* Value Highlights */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left" dir={isUrdu ? 'rtl' : 'ltr'}>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Languages className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-slate-900 text-lg mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'اردو اور رومن اردو' : 'Native Language Support'}
            </h3>
            <p className={`text-slate-600 text-sm leading-relaxed ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu
                ? 'عام پاکستانی مریض کے فہم کے مطابق آسان الفاظ اور نستعلیق فونٹ۔'
                : 'Available in Urdu (اردو), Roman Urdu, and English for maximum inclusivity.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-slate-900 text-lg mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'ٹریفک لائٹ اشارے' : 'Traffic-Light Visuals'}
            </h3>
            <p className={`text-slate-600 text-sm leading-relaxed ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu
                ? 'سبز، پیلا اور سرخ رنگوں سے فوری اندازہ لگائیں کہ کون سا نتیجہ معمول کے مطابق ہے۔'
                : 'Green (Normal), Yellow (Low), and Red (High) cards based strictly on the printed reference range.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className={`font-bold text-slate-900 text-lg mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'محفوظ اور غیر تشخیصی' : 'Ethical & Non-Diagnostic'}
            </h3>
            <p className={`text-slate-600 text-sm leading-relaxed ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu
                ? 'ہم کبھی کوئی بیماری تشخیص نہیں کرتے اور ہمیشہ ڈاکٹر سے تصدیق کا مشورہ دیتے ہیں۔'
                : 'Strict ethical guardrails prevent medical diagnosis and advise consulting your doctor.'}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>
            SehatSamajh • Built for AI for Accessible Healthcare & Well-Being Hackathon (UN SDG 3)
          </p>
          <p className="mt-1 text-slate-400">
            For educational understanding only. Always verify with your registered medical doctor.
          </p>
        </div>
      </footer>
    </div>
  );
}
