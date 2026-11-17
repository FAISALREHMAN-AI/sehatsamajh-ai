import React from 'react';
import {
  RotateCcw,
  HeartPulse,
  ShieldCheck,
} from 'lucide-react';
import UrgentBanner from '../components/UrgentBanner';
import ValueTable from '../components/ValueTable';
import MedicineList from '../components/MedicineList';
import DoctorQuestions from '../components/DoctorQuestions';
import ReadAloud from '../components/ReadAloud';
import ChatBox from '../components/ChatBox';
import LanguageToggle from '../components/LanguageToggle';

const MULTILINGUAL_DISCLAIMERS = {
  en: "Medical Disclaimer: SehatSamajh is an educational AI tool designed to help you understand medical documents in plain language. It DOES NOT provide medical diagnosis, clinical opinions, or treatment advice. Never change, pause, or stop prescribed medication on your own. Always discuss all lab results and prescriptions directly with a qualified healthcare professional.",
  ur: "طبی دستبرداری: صحت سمجھ ایک تعلیمی اے آئی ٹول ہے جو طبی دستاویزات کو آسان زبان میں سمجھنے کے لیے بنایا گیا ہے۔ یہ کوئی طبی تشخیص، معائنہ یا علاج کی تجویز فراہم نہیں کرتا۔ اپنے معالج (ڈاکٹر) کے مشورے کے بغیر ادویات میں کبھی خود سے ردوبدل نہ کریں اور نہ ہی بند کریں۔ اپنی تمام رپورٹس اور نسخہ جات مستند ڈاکٹر کو دکھا کر ان کی رہنمائی حاصل کریں۔",
  roman_ur: "Medical Disclaimer: SehatSamajh ek taleemi AI tool hai jo medical reports aur prescriptions ko aasan zuban mein samajhnay ke liye banaya gaya hai. Yeh koi tibbi tashkhees (diagnosis) ya ilaj tajweez nahi karta. Apnay doctor ke mashwaray ke baghair dawai hargiz tabdeel ya band na karein. Apni reports aur prescriptions hamesha qualified doctor ko dikhayen."
};

export default function Result({
  result,
  language,
  onLanguageChange,
  onNavigate,
}) {
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg max-w-md">
          <HeartPulse className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Analysis Result Available</h2>
          <p className="text-sm text-slate-500 mb-6">
            Please upload a lab report or prescription to see the explanation.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('analyze')}
            className="w-full py-3 px-6 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow hover:bg-emerald-700 transition"
          >
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  const isUrdu = language === 'ur';

  // Format document type badge
  const docTypeLabel =
    result.doc_type === 'lab_report'
      ? isUrdu
        ? 'لیب ٹیسٹ رپورٹ'
        : language === 'roman_ur'
        ? 'Lab Blood Report'
        : 'Laboratory Test Report'
      : result.doc_type === 'prescription'
      ? isUrdu
        ? 'ڈاکٹر کا نسخہ (Rx)'
        : language === 'roman_ur'
        ? 'Doctor Prescription (Rx)'
        : 'Doctor Prescription (Rx)'
      : isUrdu
      ? 'طبی دستاویز'
      : 'Medical Document';

  const activeDisclaimer = MULTILINGUAL_DISCLAIMERS[language] || result.disclaimer;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Sticky Navigation Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onNavigate('analyze')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            <span>{isUrdu ? 'نیا تجزیہ کریں' : 'New Analysis'}</span>
          </button>

          <div className="flex items-center gap-3">
            <ReadAloud textToRead={result.summary} language={language} />
            <LanguageToggle currentLang={language} onChange={onLanguageChange} />
          </div>
        </div>
      </header>

      {/* Main Results Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full">
        {/* Urgent Banner (Only when urgent_flag is true) */}
        {result.urgent_flag && (
          <UrgentBanner reason={result.urgent_reason} language={language} />
        )}

        {/* Top Summary Card */}
        <div className="mb-10 bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-800">
                {docTypeLabel}
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Grade-6 Plain Language</span>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Verified by SehatSamajh
            </div>
          </div>

          <div className="mt-5">
            <h2 className={`text-xl sm:text-2xl font-black text-slate-950 mb-3 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'خلاصہ اور اہم نکات' : language === 'roman_ur' ? 'Khulasa Aur Aham Nuqaat' : 'Plain Language Summary'}
            </h2>
            <p className={`text-base sm:text-lg text-slate-700 leading-relaxed ${isUrdu ? 'font-urdu' : ''}`}>
              {result.summary}
            </p>
          </div>
        </div>

        {/* Lab Items Traffic-Light Table */}
        {result.items && result.items.length > 0 && (
          <ValueTable items={result.items} language={language} />
        )}

        {/* Prescription Medicines List */}
        {result.medicines && result.medicines.length > 0 && (
          <MedicineList medicines={result.medicines} language={language} />
        )}

        {/* Questions for the Doctor */}
        {result.questions_for_doctor && result.questions_for_doctor.length > 0 && (
          <DoctorQuestions questions={result.questions_for_doctor} language={language} />
        )}

        {/* Follow-up Interactive Q&A Chat Box */}
        <ChatBox context={result} language={language} />

        {/* Mandatory Medical Disclaimer Footer */}
        <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-5 text-amber-900 text-xs sm:text-sm leading-relaxed" dir={isUrdu ? 'rtl' : 'ltr'}>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block mb-1">
                {isUrdu ? 'لازمی طبی دستبرداری (Disclaimer):' : 'Mandatory Medical Disclaimer:'}
              </strong>
              <p className={isUrdu ? 'font-urdu' : ''}>
                {activeDisclaimer}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>SehatSamajh • AI for Accessible Healthcare & Well-Being (UN SDG 3)</p>
        <p className="mt-1">
          Designed for Pakistani patients. Not a substitute for professional clinical medical advice.
        </p>
      </footer>
    </div>
  );
}
