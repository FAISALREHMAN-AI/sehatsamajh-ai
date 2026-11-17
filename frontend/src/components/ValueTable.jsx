import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function ValueTable({ items, language }) {
  if (!items || items.length === 0) return null;

  const isUrdu = language === 'ur';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isUrdu ? 'معمول (درست)' : language === 'roman_ur' ? 'Normal' : 'Normal'}</span>
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <ArrowDownRight className="w-4 h-4 text-amber-600" />
            <span>{isUrdu ? 'کم (لو)' : language === 'roman_ur' ? 'Kam (Low)' : 'Low'}</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-red-100 text-red-900 border border-red-300">
            <ArrowUpRight className="w-4 h-4 text-red-600" />
            <span>{isUrdu ? 'زیادہ (ہائی)' : language === 'roman_ur' ? 'Ziyada (High)' : 'High'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>{isUrdu ? 'غیر واضح' : language === 'roman_ur' ? 'Unclear' : 'Unclear'}</span>
          </span>
        );
    }
  };

  const getCardBorder = (status) => {
    switch (status) {
      case 'normal':
        return 'border-s-4 border-s-emerald-500 bg-white hover:bg-emerald-50/20';
      case 'low':
        return 'border-s-4 border-s-amber-500 bg-white hover:bg-amber-50/20';
      case 'high':
        return 'border-s-4 border-s-red-500 bg-white hover:bg-red-50/20';
      default:
        return 'border-s-4 border-s-slate-400 bg-white hover:bg-slate-50';
    }
  };

  return (
    <section className="mb-10" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu ? 'ٹیسٹ کے نتائج کی تفصیل' : language === 'roman_ur' ? 'Test Results Ki Tafseel' : 'Test Results & Explanations'}
          </h3>
          <p className={`text-xs sm:text-sm text-slate-500 mt-1 ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu
              ? 'ٹریفک لائٹ اشارے: سبز (معمول)، پیلا (کم)، سرخ (زیادہ)، سرمئی (غیر واضح)'
              : language === 'roman_ur'
              ? 'Traffic-light: Sabz (Normal), Peela (Low), Surkh (High), Gray (Ghair wazeh)'
              : 'Traffic-light visual: Green (Normal), Yellow (Low), Red (High), Slate (Unclear)'}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
          {items.length} {isUrdu ? 'نتائج' : 'Items'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm transition-all ${getCardBorder(item.status)}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">{item.name}</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm text-slate-600">
                  <span>
                    <strong className="text-slate-800">{isUrdu ? 'آپ کا نتیجہ:' : 'Patient Value:'} </strong>
                    <span className="font-mono text-base font-semibold text-slate-950">
                      {item.value} {item.unit}
                    </span>
                  </span>
                  {item.reference_range && (
                    <span className="text-slate-500">
                      ({isUrdu ? 'نارمل حد:' : 'Reference Range:'} {item.reference_range})
                    </span>
                  )}
                </div>
              </div>
              <div className="self-start sm:self-center">
                {getStatusBadge(item.status)}
              </div>
            </div>

            <div className="mt-3">
              <p className={`text-sm sm:text-base text-slate-700 leading-relaxed ${isUrdu ? 'font-urdu' : ''}`}>
                <span className="font-semibold text-emerald-800 block mb-0.5">
                  {isUrdu ? 'آسان وضاحت:' : language === 'roman_ur' ? 'Aasan Wazahat:' : 'Plain Explanation:'}
                </span>
                {item.plain_explanation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
