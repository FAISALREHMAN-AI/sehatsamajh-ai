import React from 'react';
import { AlertOctagon, PhoneCall, Stethoscope } from 'lucide-react';

export default function UrgentBanner({ reason, language }) {
  if (!reason) return null;

  const isUrdu = language === 'ur';

  return (
    <div
      role="alert"
      className="mb-8 rounded-2xl border-2 border-red-500 bg-red-50 p-5 sm:p-6 shadow-md transition-all animate-pulse-once"
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2.5 bg-red-600 text-white rounded-xl shadow">
          <AlertOctagon className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-200 text-red-900 uppercase tracking-wide">
              {isUrdu ? 'فوری توجہ درکار ہے' : language === 'roman_ur' ? 'Fori Tawajah Darkar Hai' : 'Urgent Medical Attention'}
            </span>
          </div>

          <h3 className={`text-lg sm:text-xl font-bold text-red-950 mb-2 ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu
              ? 'اہم انتباہ: برائے مہربانی فوری طور پر اپنے ڈاکٹر سے رابطہ کریں!'
              : language === 'roman_ur'
              ? 'Aham Notice: Meharbani farma kar fori taur par doctor se ruju karein!'
              : 'Important Notice: Please consult a qualified doctor or visit a clinic soon!'}
          </h3>

          <p className={`text-sm sm:text-base text-red-900 leading-relaxed font-medium bg-white/70 p-3.5 rounded-xl border border-red-200 ${isUrdu ? 'font-urdu' : ''}`}>
            {reason}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-red-800 font-semibold">
            <Stethoscope className="w-4 h-4 text-red-600" />
            <span>
              {isUrdu
                ? 'یہ نتیجہ معمول سے بہت مختلف ہے اور ڈاکٹر کے جائزے کا تقاضا کرتا ہے۔'
                : language === 'roman_ur'
                ? 'Yeh result aam miyaar se kaafi mukhtalif hai aur doctor ke jaizay ki zaroorat hai.'
                : 'This finding is significantly outside the reference range and requires professional medical evaluation.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
